import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "WebWizard"
    PROJECT_DESCRIPTION: str = "AI-powered website generator"
    VERSION: str = "1.0.0"
    
    # Secret key for session
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "dev_secret_key")
    
    # Server settings
    HOST: str = "0.0.0.0"
    PORT: int = 12000
    
    # Templates directory
    TEMPLATES_DIR: str = "app/templates"
    
    # Logs directory
    LOGS_DIR: str = "logs"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()