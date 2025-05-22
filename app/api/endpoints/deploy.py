from fastapi import APIRouter, Depends, HTTPException, Request, Form
from typing import Optional
import logging

from app.services.deployment import deploy_to_vercel

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/vercel")
async def deploy(
    request: Request,
    vercel_token: str = Form(...)
):
    """Deploy the generated website to Vercel."""
    try:
        html_content = request.session.get("generated_html", "")
        if not html_content:
            raise HTTPException(
                status_code=400, 
                detail="No website has been generated yet"
            )
        
        # Deploy to Vercel
        deployment_url = deploy_to_vercel(html_content, vercel_token)
        
        return {
            "success": True,
            "message": "Website deployed successfully!",
            "url": deployment_url
        }
    except Exception as e:
        logger.error(f"Error deploying website: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error: {str(e)}"
        )