"""
main.py
-------
FastAPI REST API backend entrypoint.
Orchestrates lifespan events (DB initialization, admin seeding, blog seeding, ML loading)
and mounts modular routers.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.core.config import APP_NAME, APP_VERSION
from app.core.nlp import init_nltk, load_ml_artifacts
from app.core.rate_limit import limiter
from app.database import init_db, seed_default_blogs
from app.auth import seed_default_admin

# Import Modular Routers
from app.routers import (
    health_router,
    auth_router,
    predict_router,
    history_router,
    admin_router,
    subscription_router,
    blog_router
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize DB schema, seed default admin & blogs, and load ML artifacts."""
    # 1. NLP Lexical Resources
    init_nltk()

    # 2. PostgreSQL Raw SQL Schema, Admin, and Blogs
    try:
        init_db()
        seed_default_admin()
        seed_default_blogs()
    except Exception as e:
        print(f"[!] Database initialization error: {e}")

    # 3. Load Machine Learning Artifacts
    load_ml_artifacts()

    yield

    print("[*] Veritas API server shutting down gracefully.")

# Initialize FastAPI Application
app = FastAPI(
    title=APP_NAME,
    description="Real-time Machine Learning and NLP Fake News Detection API powered by PassiveAggressive Classifier and PostgreSQL Raw SQL telemetry.",
    version=APP_VERSION,
    lifespan=lifespan
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Modular Routers
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(predict_router)
app.include_router(history_router)
app.include_router(admin_router)
app.include_router(subscription_router)
app.include_router(blog_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
