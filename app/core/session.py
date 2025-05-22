from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
import json
import base64
import secrets
from typing import Dict, Any

from app.core.config import settings

class SessionMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        self.secret_key = settings.SECRET_KEY
        self.session_cookie = "webwizard_session"
    
    async def dispatch(self, request: Request, call_next):
        session_data = self._get_session_from_cookie(request)
        request.session = session_data
        
        response = await call_next(request)
        
        self._set_session_cookie(response, request.session)
        return response
    
    def _get_session_from_cookie(self, request: Request) -> Dict[str, Any]:
        session_cookie = request.cookies.get(self.session_cookie)
        if not session_cookie:
            return {}
        
        try:
            decoded = base64.b64decode(session_cookie.encode()).decode()
            return json.loads(decoded)
        except Exception:
            return {}
    
    def _set_session_cookie(self, response: Response, session_data: Dict[str, Any]):
        if not session_data:
            return
        
        encoded_data = base64.b64encode(json.dumps(session_data).encode()).decode()
        response.set_cookie(
            key=self.session_cookie,
            value=encoded_data,
            httponly=True,
            max_age=3600,  # 1 hour
            samesite="lax"
        )