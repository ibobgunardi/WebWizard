from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from enum import Enum

class PromptRole(str, Enum):
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"

class PlaceholderScope(str, Enum):
    GLOBAL = "global"
    TYPE_SPECIFIC = "type_specific"

class RequestStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

# Placeholder schemas
class PlaceholderBase(BaseModel):
    placeholder_key: str
    placeholder_label: str
    scope: PlaceholderScope
    applicable_types: Optional[List[str]] = None
    default_value: Optional[str] = None
    detection_priority: int = 0
    description: Optional[str] = None

class PlaceholderCreate(PlaceholderBase):
    pass

class Placeholder(PlaceholderBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Prompt config schemas
class PromptConfigBase(BaseModel):
    role: PromptRole
    sequence_order: int = 1
    prompt_content: str
    is_required: bool = True

class PromptConfigCreate(PromptConfigBase):
    template_id: int

class PromptConfig(PromptConfigBase):
    id: int
    template_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Template schemas
class TemplateBase(BaseModel):
    type: str
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    is_active: bool = True
    version: str = "1.0"

class TemplateCreate(TemplateBase):
    pass

class Template(TemplateBase):
    id: int
    created_at: datetime
    updated_at: datetime
    prompt_configs: List[PromptConfig] = []
    
    class Config:
        from_attributes = True

class TemplateWithPrompts(Template):
    system_prompts: List[str] = []
    user_prompts: List[str] = []
    available_placeholders: List[Dict[str, Any]] = []

# User request schemas
class UserRequestBase(BaseModel):
    template_id: int
    user_id: Optional[int] = None
    user_input: str

class UserRequestCreate(UserRequestBase):
    pass

class UserRequest(UserRequestBase):
    id: int
    extracted_data: Optional[Dict[str, Any]] = None
    resolved_prompts: Dict[str, List[str]]
    ai_response: Optional[str] = None
    status: RequestStatus
    error_message: Optional[str] = None
    processing_time_ms: Optional[int] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Response schemas
class PromptResponse(BaseModel):
    success: bool
    message: str
    prompts: Optional[Dict[str, List[str]]] = None
    placeholders: Optional[Dict[str, Any]] = None