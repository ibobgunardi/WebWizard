from fastapi import APIRouter, Depends, HTTPException, Request, Form, File, UploadFile
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from typing import Optional
import base64
import os
from datetime import datetime
from sqlalchemy.orm import Session

from app.core.config import settings
from app.schemas.website import WebsiteRequest, WebsiteResponse
from app.services.website_generator import generate_website
from app.utils.language_detector import detect_language
from app.db.database import get_db
from app.services.prompt_service import PromptService
from app.crud import ai_templates

router = APIRouter()
templates = Jinja2Templates(directory=settings.TEMPLATES_DIR)

@router.get("/", response_class=HTMLResponse)
async def index(request: Request):
    """Render the main page of the application."""
    return templates.TemplateResponse("index.html", {"request": request})

@router.get("/templates", response_class=HTMLResponse)
async def get_templates(request: Request, db: Session = Depends(get_db)):
    """Get available website templates."""
    templates_list = ai_templates.get_templates(db)
    return templates.TemplateResponse(
        "index.html", 
        {"request": request, "templates": templates_list}
    )

@router.post("/generate", response_model=WebsiteResponse)
async def generate(
    website_type: str = Form(...),
    content: str = Form(...),
    style: str = Form(...),
    api_token: str = Form(...),
    color_palette: Optional[str] = Form(None),
    photo: Optional[UploadFile] = File(None),
    request: Request = None,
    db: Session = Depends(get_db)
):
    """Generate a website based on user input using OpenRouter API."""
    try:
        # Process photo if provided
        photo_data = None
        if photo:
            contents = await photo.read()
            photo_data = base64.b64encode(contents).decode("utf-8")
        
        # Detect language
        language = detect_language(content)
        
        # Get template from database
        prompt_service = PromptService(db)
        template_data = prompt_service.get_template_prompts(website_type)
        
        # Generate website HTML using AI
        html_content = generate_website(
            website_type=website_type,
            content=content,
            style=style,
            language=language,
            api_token=api_token,
            color_palette=color_palette,
            photo_data=photo_data
        )
        
        # Log the final HTML
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        final_html_path = f"logs/html_dumps/final_html_{timestamp}.html"
        os.makedirs(os.path.dirname(final_html_path), exist_ok=True)
        with open(final_html_path, 'w') as f:
            f.write(html_content)
        
        # Store the generated HTML in the session
        if request and hasattr(request, "session"):
            request.session["generated_html"] = html_content
        
        return {
            "success": True,
            "message": "Website generated successfully!",
            "html": html_content
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))