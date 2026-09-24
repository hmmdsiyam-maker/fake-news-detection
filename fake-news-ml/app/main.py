"""
main.py
-------
FastAPI REST API backend serving the Fake News Detection ML model,
PostgreSQL Raw SQL user authentication, per-person prediction history,
and administrative management panel.
"""

import os
import re
import math
import time
import joblib
from contextlib import asynccontextmanager
from typing import Optional, List
from collections import defaultdict

from fastapi import FastAPI, HTTPException, status, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# In-memory guest usage tracker (per client IP)
guest_usage_tracker = defaultdict(int)
GUEST_USAGE_LIMIT = 5

import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

from app.database import (
    init_db,
    raw_create_user,
    raw_get_user_by_username,
    raw_get_user_by_email,
    raw_update_last_login,
    raw_save_history,
    raw_get_user_history,
    raw_delete_history_item,
    raw_clear_user_history,
    raw_get_admin_stats,
    raw_get_admin_users,
    raw_get_admin_global_history,
    raw_delete_user_by_admin
)
from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    get_current_user_optional,
    require_admin,
    seed_default_admin
)

# --- Text Preprocessing Globals & Cache ---
_LEMMA_CACHE = {}
_LEMMATIZER = None
_STOP_WORDS = None
_URL_REGEX = re.compile(r"https?://\S+|www\.\S+|<.*?>")
_CLEAN_REGEX = re.compile(r"[^a-z\s]")

ml_artifacts = {
    "model": None,
    "vectorizer": None
}

def init_nltk():
    """Ensure required NLTK resources are available at runtime."""
    global _LEMMATIZER, _STOP_WORDS
    try:
        _STOP_WORDS = set(stopwords.words("english"))
        _LEMMATIZER = WordNetLemmatizer()
    except LookupError:
        nltk.download("stopwords", quiet=True)
        nltk.download("wordnet", quiet=True)
        nltk.download("omw-1.4", quiet=True)
        _STOP_WORDS = set(stopwords.words("english"))
        _LEMMATIZER = WordNetLemmatizer()

def fast_lemmatize(word: str) -> str:
    """Cached lemmatization identical to training pipeline."""
    if word not in _LEMMA_CACHE:
        _LEMMA_CACHE[word] = _LEMMATIZER.lemmatize(word)
    return _LEMMA_CACHE[word]

def preprocess_text(text: str) -> str:
    """NLP Preprocessing Pipeline identical to model training."""
    if not isinstance(text, str) or not text.strip():
        return ""
    text = _URL_REGEX.sub(" ", text.lower())
    text = _CLEAN_REGEX.sub(" ", text)
    tokens = text.split()
    cleaned = [fast_lemmatize(w) for w in tokens if w not in _STOP_WORDS and len(w) > 2]
    return " ".join(cleaned)

# --- Lifespan Event Handler ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize DB schema, seed admin, and load ML artifacts."""
    init_nltk()

    # 1. Initialize PostgreSQL Raw SQL Schema & Seed Admin
    try:
        init_db()
        seed_default_admin()
    except Exception as e:
        print(f"[!] Database initialization error: {e}")

    # 2. Load ML Artifacts
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model_path = os.path.join(base_dir, "models", "fake_news_model.pkl")
    vec_path = os.path.join(base_dir, "models", "tfidf_vectorizer.pkl")

    if not os.path.exists(model_path) or not os.path.exists(vec_path):
        print(f"[!] Warning: Missing artifacts: {model_path} or {vec_path}")
    else:
        print(f"[*] Loading ML model from: {model_path}")
        ml_artifacts["model"] = joblib.load(model_path)
        print(f"[*] Loading TF-IDF vectorizer from: {vec_path}")
        ml_artifacts["vectorizer"] = joblib.load(vec_path)
        print("[+] Artifacts loaded successfully into memory.")
    
    yield
    ml_artifacts.clear()

# --- FastAPI Initialization ---
app = FastAPI(
    title="AI Fake News Truth Console API",
    description="NLP Inference, PostgreSQL Raw SQL Auth, Search History, & Admin Telemetry.",
    version="2.0.0",
    lifespan=lifespan
)

# CORS
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# SCHEMAS
# ==============================================================================

class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: str = Field(min_length=5, max_length=128)
    password: str = Field(min_length=6, max_length=100)

class LoginRequest(BaseModel):
    username_or_email: str
    password: str

class AuthResponse(BaseModel):
    token: str
    user: dict

class PredictRequest(BaseModel):
    title: Optional[str] = Field(default="", description="Headline or title")
    text: Optional[str] = Field(default="", description="Article body content")

class PredictResponse(BaseModel):
    prediction: str
    label: int
    confidence: float
    latency_ms: int
    saved_to_history: bool
    guest_remaining: Optional[int] = None
    status: str = "success"

# ==============================================================================
# GENERAL & HEALTH ENDPOINTS
# ==============================================================================

@app.get("/", tags=["Health"])
async def root():
    return {
        "status": "online",
        "service": "AI Fake News Truth Console API",
        "version": "2.0.0",
        "database": "PostgreSQL (Raw SQL)"
    }

@app.get("/health", tags=["Health"])
async def health():
    is_ready = ml_artifacts.get("model") is not None and ml_artifacts.get("vectorizer") is not None
    return {
        "status": "healthy" if is_ready else "degraded",
        "model_loaded": ml_artifacts.get("model") is not None,
        "vectorizer_loaded": ml_artifacts.get("vectorizer") is not None
    }

# ==============================================================================
# AUTHENTICATION ENDPOINTS (RAW SQL)
# ==============================================================================

@app.post("/api/v1/auth/register", response_model=AuthResponse, tags=["Authentication"])
async def register(payload: RegisterRequest):
    """Register a new user account with Raw SQL queries."""
    clean_username = payload.username.strip()
    clean_email = payload.email.strip().lower()

    if raw_get_user_by_username(clean_username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken. Please choose another."
        )

    if raw_get_user_by_email(clean_email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address already registered."
        )

    hashed_pwd = hash_password(payload.password)
    user = raw_create_user(
        username=clean_username,
        email=clean_email,
        password_hash=hashed_pwd,
        role="user"
    )

    token = create_access_token(user["id"], user["username"], user["role"])
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"]
        }
    }

@app.post("/api/v1/auth/login", response_model=AuthResponse, tags=["Authentication"])
async def login(payload: LoginRequest):
    """Authenticate user with Raw SQL lookup and return JWT token."""
    identifier = payload.username_or_email.strip()
    user = None

    if "@" in identifier:
        user = raw_get_user_by_email(identifier)
    if not user:
        user = raw_get_user_by_username(identifier)

    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Please verify username/email and password."
        )

    raw_update_last_login(user["id"])
    token = create_access_token(user["id"], user["username"], user["role"])

    return {
        "token": token,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"]
        }
    }

@app.get("/api/v1/auth/me", tags=["Authentication"])
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """Return currently authenticated user profile."""
    return {
        "id": current_user["id"],
        "username": current_user["username"],
        "email": current_user["email"],
        "role": current_user["role"],
        "created_at": current_user["created_at"],
        "last_login": current_user["last_login"]
    }

# ==============================================================================
# INFERENCE & SEARCH HISTORY RECORDING ENDPOINT
# ==============================================================================

@app.post("/api/v1/predict", response_model=PredictResponse, tags=["Inference"])
async def predict_news(
    payload: PredictRequest,
    request: Request,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    Predict whether news is Fake or Real.
    If guest (non-logged in), allows exactly 5 free evaluations before requiring authentication.
    If authenticated, automatically records the search in PostgreSQL history via Raw SQL.
    """
    model = ml_artifacts.get("model")
    vectorizer = ml_artifacts.get("vectorizer")

    if model is None or vectorizer is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model artifacts are not loaded. Ensure models exist in `models/`."
        )

    # Enforce 5-times guest analysis limit
    guest_remaining = None
    if current_user is None:
        client_ip = request.client.host if request.client else "guest_client"
        if guest_usage_tracker[client_ip] >= GUEST_USAGE_LIMIT:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You have used all {GUEST_USAGE_LIMIT} free guest analyses. Please sign in or create an account to continue using the console."
            )
        guest_usage_tracker[client_ip] += 1
        guest_remaining = max(0, GUEST_USAGE_LIMIT - guest_usage_tracker[client_ip])

    raw_content = f"{payload.title or ''} {payload.text or ''}".strip()
    if not raw_content:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Please provide an article headline or text to analyze."
        )

    start_time = time.perf_counter()

    # Preprocess & Vectorize
    cleaned_content = preprocess_text(raw_content) or raw_content.lower()
    tfidf_features = vectorizer.transform([cleaned_content])

    # Classify
    pred = int(model.predict(tfidf_features)[0])

    # Calibrate Confidence
    if hasattr(model, "decision_function"):
        margin = float(model.decision_function(tfidf_features)[0])
        prob_fake = 1.0 / (1.0 + math.exp(-max(min(margin, 20.0), -20.0)))
        confidence = round((prob_fake if pred == 1 else (1.0 - prob_fake)) * 100.0, 2)
    elif hasattr(model, "predict_proba"):
        probs = model.predict_proba(tfidf_features)[0]
        confidence = round(float(probs[pred]) * 100.0, 2)
    else:
        confidence = 95.0

    confidence = max(confidence, 50.0)
    prediction_label = "Fake News" if pred == 1 else "Real News"
    latency_ms = max(int((time.perf_counter() - start_time) * 1000), 1)

    # Automatically save to PostgreSQL prediction history using Raw SQL
    saved = False
    if current_user:
        try:
            preview = (payload.text or payload.title or "")[:240]
            raw_save_history(
                user_id=current_user["id"],
                headline=payload.title or "Untitled",
                content_preview=preview,
                prediction=prediction_label,
                label=pred,
                confidence=confidence,
                latency_ms=latency_ms
            )
            saved = True
        except Exception as e:
            print(f"[!] Error recording prediction history: {e}")

    return PredictResponse(
        prediction=prediction_label,
        label=pred,
        confidence=confidence,
        latency_ms=latency_ms,
        saved_to_history=saved,
        guest_remaining=guest_remaining,
        status="success"
    )

# ==============================================================================
# PER-PERSON USER SEARCH HISTORY ENDPOINTS (RAW SQL)
# ==============================================================================

@app.get("/api/v1/history", tags=["Search History"])
async def get_my_history(
    limit: int = 50,
    offset: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Retrieve personal prediction search history using Raw SQL queries."""
    records = raw_get_user_history(current_user["id"], limit=limit, offset=offset)
    return {"history": records, "count": len(records)}

@app.delete("/api/v1/history/{history_id}", tags=["Search History"])
async def delete_single_history_item(
    history_id: int,
    current_user: dict = Depends(get_current_user)
):
    """Delete a single prediction history entry belonging to current user."""
    success = raw_delete_history_item(history_id, current_user["id"])
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="History record not found or not owned by you."
        )
    return {"status": "deleted", "id": history_id}

@app.delete("/api/v1/history", tags=["Search History"])
async def clear_my_history(current_user: dict = Depends(get_current_user)):
    """Clear all prediction search history for the logged in user."""
    raw_clear_user_history(current_user["id"])
    return {"status": "cleared", "user_id": current_user["id"]}

# ==============================================================================
# ADMIN PANEL ENDPOINTS (RAW SQL)
# ==============================================================================

@app.get("/api/v1/admin/stats", tags=["Admin Panel"])
async def get_admin_dashboard_stats(admin_user: dict = Depends(require_admin)):
    """System overview statistics aggregated with Raw SQL."""
    stats = raw_get_admin_stats()
    return stats

@app.get("/api/v1/admin/users", tags=["Admin Panel"])
async def get_admin_users_list(admin_user: dict = Depends(require_admin)):
    """List all registered users with prediction counts via Raw SQL."""
    users = raw_get_admin_users()
    return {"users": users, "count": len(users)}

@app.get("/api/v1/admin/history", tags=["Admin Panel"])
async def get_admin_global_history(
    limit: int = 100,
    admin_user: dict = Depends(require_admin)
):
    """Global system audit log of all predictions via Raw SQL."""
    logs = raw_get_admin_global_history(limit=limit)
    return {"logs": logs, "count": len(logs)}

@app.delete("/api/v1/admin/users/{user_id}", tags=["Admin Panel"])
async def delete_user(user_id: int, admin_user: dict = Depends(require_admin)):
    """Delete user account (cannot delete admin)."""
    if user_id == admin_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself as administrator."
        )
    deleted = raw_delete_user_by_admin(user_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or is protected."
        )
    return {"status": "deleted", "user_id": user_id}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
