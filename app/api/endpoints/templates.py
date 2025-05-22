from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.db.database import get_db
from app.crud import ai_templates
from app.schemas.ai_templates import (
    Template, 
    TemplateCreate, 
    PromptConfig, 
    PromptConfigCreate,
    Placeholder,
    PlaceholderCreate,
    UserRequestCreate,
    UserRequest,
    PromptResponse
)
from app.services.prompt_service import PromptService

router = APIRouter()

@router.get("/", response_model=List[Template])
def get_templates(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """Get all templates."""
    templates = ai_templates.get_templates(db, skip=skip, limit=limit)
    return templates

@router.get("/{template_id}", response_model=Template)
def get_template(
    template_id: int, 
    db: Session = Depends(get_db)
):
    """Get a specific template by ID."""
    db_template = ai_templates.get_template(db, template_id=template_id)
    if db_template is None:
        raise HTTPException(status_code=404, detail="Template not found")
    return db_template

@router.get("/type/{template_type}", response_model=PromptResponse)
def get_template_by_type(
    template_type: str, 
    db: Session = Depends(get_db)
):
    """Get a template by type with its prompts and placeholders."""
    prompt_service = PromptService(db)
    result = prompt_service.get_template_prompts(template_type)
    
    if not result["success"]:
        raise HTTPException(status_code=404, detail=result["message"])
    
    return result

@router.post("/", response_model=Template)
def create_template(
    template: TemplateCreate, 
    db: Session = Depends(get_db)
):
    """Create a new template."""
    return ai_templates.create_template(db=db, template=template)

@router.post("/prompts/", response_model=PromptConfig)
def create_prompt_config(
    prompt_config: PromptConfigCreate, 
    db: Session = Depends(get_db)
):
    """Create a new prompt configuration."""
    return ai_templates.create_prompt_config(db=db, prompt_config=prompt_config)

@router.post("/placeholders/", response_model=Placeholder)
def create_placeholder(
    placeholder: PlaceholderCreate, 
    db: Session = Depends(get_db)
):
    """Create a new placeholder."""
    return ai_templates.create_placeholder(db=db, placeholder=placeholder)

@router.post("/process-request/", response_model=PromptResponse)
def process_user_request(
    user_request: UserRequestCreate, 
    db: Session = Depends(get_db)
):
    """Process a user request by extracting placeholders and resolving prompts."""
    prompt_service = PromptService(db)
    result = prompt_service.process_user_request(user_request)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["message"])
    
    return result