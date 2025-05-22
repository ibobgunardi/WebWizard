from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class WebsiteRequest(BaseModel):
    website_type: str = Field(..., description="Type of website (CV, landing page, portfolio)")
    content: str = Field(..., description="User's content to transform")
    style: str = Field(..., description="Selected style template")
    api_token: str = Field(..., description="OpenRouter API token")
    color_palette: Optional[Dict[str, str]] = Field(None, description="Color palette to use for the website")
    photo_data: Optional[str] = Field(None, description="Base64 encoded photo data")

class WebsiteResponse(BaseModel):
    success: bool
    message: str
    html: Optional[str] = None