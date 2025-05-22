from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

from app.core.config import settings

router = APIRouter()
templates = Jinja2Templates(directory=settings.TEMPLATES_DIR)

@router.get("/", response_class=HTMLResponse)
async def preview(request: Request):
    """Display the preview of the generated website."""
    html_content = request.session.get("generated_html", "")
    if not html_content:
        return templates.TemplateResponse(
            "index.html", 
            {"request": request, "error": "No website has been generated yet"}
        )
    
    return templates.TemplateResponse(
        "preview.html", 
        {"request": request, "html_content": html_content}
    )

@router.get("/download-pdf")
async def download_pdf(request: Request):
    """Generate a PDF from the HTML content."""
    html_content = request.session.get("generated_html", "")
    if not html_content:
        raise HTTPException(
            status_code=400, 
            detail="No website has been generated yet"
        )
    
    # We'll use the html2pdf.js library on the client side for PDF generation
    # This route is just a placeholder for future server-side PDF generation if needed
    return {
        "success": True,
        "html": html_content
    }