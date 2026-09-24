"""
routers/health.py
-----------------
Health check and root service diagnostic endpoints.
"""

from fastapi import APIRouter
from app.core.nlp import ml_artifacts
from app.core.config import APP_NAME, APP_VERSION

router = APIRouter(tags=["Health"])

@router.get("/")
async def root():
    return {
        "status": "online",
        "service": APP_NAME,
        "version": APP_VERSION,
        "database": "PostgreSQL (Raw SQL)"
    }

@router.get("/health")
async def health():
    is_ready = ml_artifacts.get("model") is not None and ml_artifacts.get("vectorizer") is not None
    return {
        "status": "healthy" if is_ready else "degraded",
        "model_loaded": ml_artifacts.get("model") is not None,
        "vectorizer_loaded": ml_artifacts.get("vectorizer") is not None
    }
