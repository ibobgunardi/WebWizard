from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, Enum, JSON, DateTime, BigInteger
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import enum

from app.db.database import Base

class RequestTemplateType(str, enum.Enum):
    CV = "cv"
    PORTFOLIO = "portfolio"
    LANDING_PAGE = "landing_page"
    BLOG_POST = "blog_post"

class PromptRole(str, enum.Enum):
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"

class PlaceholderScope(str, enum.Enum):
    GLOBAL = "global"
    TYPE_SPECIFIC = "type_specific"

class RequestStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class AIRequestTemplate(Base):
    __tablename__ = "ai_request_templates"
    
    id = Column(BigInteger, primary_key=True, index=True)
    type = Column(String(50), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), nullable=True, index=True)
    is_active = Column(Boolean, default=True, index=True)
    version = Column(String(10), default="1.0")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    prompt_configs = relationship("AIPromptConfig", back_populates="template", cascade="all, delete-orphan")
    user_requests = relationship("AIUserRequest", back_populates="template")

class AIPromptConfig(Base):
    __tablename__ = "ai_prompt_configs"
    
    id = Column(BigInteger, primary_key=True, index=True)
    template_id = Column(BigInteger, ForeignKey("ai_request_templates.id", ondelete="CASCADE"), nullable=False)
    role = Column(Enum(PromptRole), nullable=False)
    sequence_order = Column(Integer, default=1, nullable=False)
    prompt_content = Column(Text, nullable=False)
    is_required = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    template = relationship("AIRequestTemplate", back_populates="prompt_configs")

class AIAutoPlaceholder(Base):
    __tablename__ = "ai_auto_placeholders"
    
    id = Column(BigInteger, primary_key=True, index=True)
    placeholder_key = Column(String(100), nullable=False, unique=True, index=True)
    placeholder_label = Column(String(100), nullable=False)
    scope = Column(Enum(PlaceholderScope), nullable=False, index=True)
    applicable_types = Column(JSON, nullable=True)
    default_value = Column(Text, nullable=True)
    detection_priority = Column(Integer, default=0)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class AIUserRequest(Base):
    __tablename__ = "ai_user_requests"
    
    id = Column(BigInteger, primary_key=True, index=True)
    template_id = Column(BigInteger, ForeignKey("ai_request_templates.id"), nullable=False)
    user_id = Column(BigInteger, nullable=True)
    user_input = Column(Text, nullable=False)
    extracted_data = Column(JSON, nullable=True)
    resolved_prompts = Column(JSON, nullable=False)
    ai_response = Column(Text, nullable=True)
    status = Column(Enum(RequestStatus), default=RequestStatus.PENDING, index=True)
    error_message = Column(Text, nullable=True)
    processing_time_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    template = relationship("AIRequestTemplate", back_populates="user_requests")