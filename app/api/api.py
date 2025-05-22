from fastapi import APIRouter
from app.api.endpoints import website, preview, deploy, templates

api_router = APIRouter()

api_router.include_router(website.router, prefix="/website", tags=["website"])
api_router.include_router(preview.router, prefix="/preview", tags=["preview"])
api_router.include_router(deploy.router, prefix="/deploy", tags=["deploy"])
api_router.include_router(templates.router, prefix="/templates", tags=["templates"])