from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Dict, Any, Optional
import json

from app.models.ai_templates import (
    AIRequestTemplate, 
    AIPromptConfig, 
    AIAutoPlaceholder, 
    AIUserRequest,
    PromptRole,
    PlaceholderScope
)
from app.schemas.ai_templates import (
    TemplateCreate, 
    PromptConfigCreate, 
    PlaceholderCreate, 
    UserRequestCreate
)

# Template CRUD operations
def get_template(db: Session, template_id: int):
    return db.query(AIRequestTemplate).filter(AIRequestTemplate.id == template_id).first()

def get_template_by_type(db: Session, template_type: str):
    return db.query(AIRequestTemplate).filter(
        AIRequestTemplate.type == template_type,
        AIRequestTemplate.is_active == True
    ).first()

def get_templates(db: Session, skip: int = 0, limit: int = 100):
    return db.query(AIRequestTemplate).offset(skip).limit(limit).all()

def create_template(db: Session, template: TemplateCreate):
    db_template = AIRequestTemplate(**template.model_dump())
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

def update_template(db: Session, template_id: int, template_data: Dict[str, Any]):
    db_template = get_template(db, template_id)
    if db_template:
        for key, value in template_data.items():
            setattr(db_template, key, value)
        db.commit()
        db.refresh(db_template)
    return db_template

def delete_template(db: Session, template_id: int):
    db_template = get_template(db, template_id)
    if db_template:
        db.delete(db_template)
        db.commit()
        return True
    return False

# Prompt Config CRUD operations
def get_prompt_configs(db: Session, template_id: int):
    return db.query(AIPromptConfig).filter(
        AIPromptConfig.template_id == template_id
    ).order_by(AIPromptConfig.role, AIPromptConfig.sequence_order).all()

def create_prompt_config(db: Session, prompt_config: PromptConfigCreate):
    db_prompt_config = AIPromptConfig(**prompt_config.model_dump())
    db.add(db_prompt_config)
    db.commit()
    db.refresh(db_prompt_config)
    return db_prompt_config

def update_prompt_config(db: Session, prompt_id: int, prompt_data: Dict[str, Any]):
    db_prompt = db.query(AIPromptConfig).filter(AIPromptConfig.id == prompt_id).first()
    if db_prompt:
        for key, value in prompt_data.items():
            setattr(db_prompt, key, value)
        db.commit()
        db.refresh(db_prompt)
    return db_prompt

def delete_prompt_config(db: Session, prompt_id: int):
    db_prompt = db.query(AIPromptConfig).filter(AIPromptConfig.id == prompt_id).first()
    if db_prompt:
        db.delete(db_prompt)
        db.commit()
        return True
    return False

# Placeholder CRUD operations
def get_placeholders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(AIAutoPlaceholder).offset(skip).limit(limit).all()

def get_placeholders_for_template_type(db: Session, template_type: str):
    # Get global placeholders
    global_placeholders = db.query(AIAutoPlaceholder).filter(
        AIAutoPlaceholder.scope == PlaceholderScope.GLOBAL
    ).all()
    
    # Get type-specific placeholders
    type_specific_placeholders = db.query(AIAutoPlaceholder).filter(
        AIAutoPlaceholder.scope == PlaceholderScope.TYPE_SPECIFIC,
        func.json_contains(AIAutoPlaceholder.applicable_types, f'"{template_type}"')
    ).all()
    
    # Combine both lists
    return global_placeholders + type_specific_placeholders

def create_placeholder(db: Session, placeholder: PlaceholderCreate):
    db_placeholder = AIAutoPlaceholder(**placeholder.model_dump())
    db.add(db_placeholder)
    db.commit()
    db.refresh(db_placeholder)
    return db_placeholder

# User Request CRUD operations
def create_user_request(db: Session, user_request: UserRequestCreate, 
                        extracted_data: Dict[str, Any], resolved_prompts: Dict[str, List[str]]):
    db_user_request = AIUserRequest(
        template_id=user_request.template_id,
        user_id=user_request.user_id,
        user_input=user_request.user_input,
        extracted_data=extracted_data,
        resolved_prompts=resolved_prompts
    )
    db.add(db_user_request)
    db.commit()
    db.refresh(db_user_request)
    return db_user_request

def update_user_request_status(db: Session, request_id: int, status: str, 
                              ai_response: Optional[str] = None, 
                              error_message: Optional[str] = None,
                              processing_time_ms: Optional[int] = None):
    db_request = db.query(AIUserRequest).filter(AIUserRequest.id == request_id).first()
    if db_request:
        db_request.status = status
        if ai_response:
            db_request.ai_response = ai_response
        if error_message:
            db_request.error_message = error_message
        if processing_time_ms:
            db_request.processing_time_ms = processing_time_ms
        if status == "completed" or status == "failed":
            db_request.completed_at = func.now()
        db.commit()
        db.refresh(db_request)
    return db_request

# Get complete template with prompts and placeholders
def get_complete_template(db: Session, template_type: str):
    # Get the template
    template = get_template_by_type(db, template_type)
    if not template:
        return None
    
    # Get prompt configs
    prompt_configs = get_prompt_configs(db, template.id)
    
    # Organize prompts by role
    system_prompts = []
    user_prompts = []
    
    for config in prompt_configs:
        if config.role == PromptRole.SYSTEM:
            system_prompts.append({
                "sequence_order": config.sequence_order,
                "content": config.prompt_content
            })
        elif config.role == PromptRole.USER:
            user_prompts.append({
                "sequence_order": config.sequence_order,
                "content": config.prompt_content
            })
    
    # Sort by sequence order
    system_prompts.sort(key=lambda x: x["sequence_order"])
    user_prompts.sort(key=lambda x: x["sequence_order"])
    
    # Get placeholders
    placeholders = get_placeholders_for_template_type(db, template_type)
    placeholder_data = []
    
    for p in placeholders:
        placeholder_data.append({
            "key": p.placeholder_key,
            "label": p.placeholder_label,
            "default_value": p.default_value,
            "priority": p.detection_priority,
            "description": p.description
        })
    
    return {
        "template": template,
        "system_prompts": [p["content"] for p in system_prompts],
        "user_prompts": [p["content"] for p in user_prompts],
        "available_placeholders": placeholder_data
    }