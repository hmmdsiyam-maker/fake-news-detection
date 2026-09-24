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
    raw_delete_user_by_admin,
    raw_get_user_today_prediction_count,
    raw_update_user_subscription
)
import stripe

# Stripe API Key Configuration
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
stripe.api_key = STRIPE_SECRET_KEY

# Daily usage limits
DAILY_FREE_LIMIT = 20

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
    daily_remaining: Optional[int] = None
    subscription_tier: Optional[str] = "free"
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

    tier = user.get("subscription_tier", "free")
    token = create_access_token(user["id"], user["username"], user["role"], tier)
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
            "subscription_tier": tier
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
    tier = user.get("subscription_tier", "free")
    token = create_access_token(user["id"], user["username"], user["role"], tier)

    return {
        "token": token,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
            "subscription_tier": tier
        }
    }

@app.get("/api/v1/auth/me", tags=["Authentication"])
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """Return currently authenticated user profile with live daily usage quota."""
    today_count = raw_get_user_today_prediction_count(current_user["id"])
    tier = current_user.get("subscription_tier", "free")
    role = current_user.get("role", "user")
    is_unlimited = (tier in ["pro", "enterprise"]) or (role == "admin")
    remaining = -1 if is_unlimited else max(0, DAILY_FREE_LIMIT - today_count)

    return {
        "id": current_user["id"],
        "username": current_user["username"],
        "email": current_user["email"],
        "role": current_user["role"],
        "subscription_tier": tier,
        "today_count": today_count,
        "daily_limit": "unlimited" if is_unlimited else DAILY_FREE_LIMIT,
        "today_remaining": remaining,
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
    If guest (non-logged in): allows exactly 5 free evaluations before requiring authentication.
    If registered user on free tier: allows 20 verifications per day (resets daily at 00:00 UTC).
    If Pro / Enterprise / Admin: unlimited verifications.
    """
    model = ml_artifacts.get("model")
    vectorizer = ml_artifacts.get("vectorizer")

    if model is None or vectorizer is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model artifacts are not loaded. Ensure models exist in `models/`."
        )

    guest_remaining = None
    daily_remaining = None
    tier = "guest"

    # Enforce Guest and Free Quotas
    if current_user is None:
        client_ip = request.client.host if request.client else "guest_client"
        if guest_usage_tracker[client_ip] >= GUEST_USAGE_LIMIT:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You have used all {GUEST_USAGE_LIMIT} free guest analyses. Please sign in or create an account to continue using the console."
            )
        guest_usage_tracker[client_ip] += 1
        guest_remaining = max(0, GUEST_USAGE_LIMIT - guest_usage_tracker[client_ip])
    else:
        tier = current_user.get("subscription_tier", "free")
        role = current_user.get("role", "user")
        is_unlimited = (tier in ["pro", "enterprise"]) or (role == "admin")

        if not is_unlimited:
            today_count = raw_get_user_today_prediction_count(current_user["id"])
            if today_count >= DAILY_FREE_LIMIT:
                raise HTTPException(
                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                    detail=f"Daily limit reached ({DAILY_FREE_LIMIT}/{DAILY_FREE_LIMIT} verifications used today). Upgrade to Pro for unlimited verifications."
                )
            daily_remaining = max(0, DAILY_FREE_LIMIT - (today_count + 1))
        else:
            daily_remaining = -1

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
        daily_remaining=daily_remaining,
        subscription_tier=tier,
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
# ==============================================================================
# STRIPE SUBSCRIPTION & MONETIZATION ENDPOINTS (RAW SQL)
# ==============================================================================

SUBSCRIPTION_PLANS = [
    {
        "id": "free",
        "name": "Free Starter",
        "price": 0,
        "currency": "usd",
        "interval": "forever",
        "daily_limit": 20,
        "description": "Essential fact-checking tools for everyday casual readers.",
        "badge": "STARTER",
        "features": [
            "20 Daily AI Verifications (resets every 24h)",
            "PassiveAggressive ML Classifier (96.87% Accuracy)",
            "Personal Search History (Up to 50 items)",
            "Standard Confidence Score Gauge",
            "Community Support"
        ]
    },
    {
        "id": "pro",
        "name": "Pro Verifier",
        "price": 9.99,
        "currency": "usd",
        "interval": "month",
        "daily_limit": "Unlimited",
        "description": "Designed for journalists, researchers, and professional content creators.",
        "badge": "MOST POPULAR",
        "is_popular": True,
        "features": [
            "⚡ Unlimited Daily AI Verifications",
            "🚀 High-Priority Inference Pipeline (<50ms)",
            "📜 Full Audit History with Re-run & Search",
            "📊 Data Export (CSV & JSON)",
            "🛡️ Verified Pro Badge on Dashboard",
            "💬 Priority Direct Support"
        ]
    },
    {
        "id": "enterprise",
        "name": "Enterprise / Newsroom",
        "price": 49.99,
        "currency": "usd",
        "interval": "month",
        "daily_limit": "Unlimited",
        "description": "Full-scale fake news mitigation suite for media houses and platforms.",
        "badge": "SCALE",
        "features": [
            "🏢 Everything in Pro for Entire Newsroom",
            "🔌 Dedicated REST API Key & Webhooks",
            "🧠 Custom Fine-Tuned Domain Models",
            "⚡ 99.9% High Availability SLA",
            "👔 24/7 Dedicated Account Engineer"
        ]
    }
]

class CreateCheckoutRequest(BaseModel):
    plan_id: str
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None

class VerifySessionRequest(BaseModel):
    session_id: str
    plan_id: str

@app.get("/api/v1/subscription/plans", tags=["Subscription"])
async def get_subscription_plans():
    """Return list of subscription tiers, pricing, and feature breakdown."""
    return {"plans": SUBSCRIPTION_PLANS}

@app.post("/api/v1/subscription/create-checkout-session", tags=["Subscription"])
async def create_checkout_session(
    payload: CreateCheckoutRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a Stripe Checkout session.
    If real STRIPE_SECRET_KEY is configured in the environment, creates a live Stripe Session.
    If STRIPE_SECRET_KEY is missing/empty, operates in Sandbox Simulator mode.
    """
    plan = next((p for p in SUBSCRIPTION_PLANS if p["id"] == payload.plan_id), None)
    if not plan or plan["id"] == "free":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid subscription plan selected."
        )

    # 1. Real Stripe Integration if API key is provided
    if STRIPE_SECRET_KEY and not STRIPE_SECRET_KEY.startswith("mock"):
        try:
            domain = payload.success_url or "http://localhost:3000"
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                customer_email=current_user["email"],
                client_reference_id=str(current_user["id"]),
                line_items=[
                    {
                        "price_data": {
                            "currency": "usd",
                            "product_data": {
                                "name": f"Truth Console - {plan['name']}",
                                "description": plan["description"]
                            },
                            "unit_amount": int(plan["price"] * 100),
                            "recurring": {"interval": "month"}
                        },
                        "quantity": 1
                    }
                ],
                mode="subscription",
                success_url=f"{domain}?session_id={{CHECKOUT_SESSION_ID}}&plan_id={plan['id']}&checkout=success",
                cancel_url=f"{domain}?checkout=cancelled",
                metadata={
                    "user_id": str(current_user["id"]),
                    "plan_id": plan["id"]
                }
            )
            return {
                "checkout_url": checkout_session.url,
                "session_id": checkout_session.id,
                "mode": "live_stripe",
                "plan": plan
            }
        except Exception as e:
            print(f"[!] Stripe Checkout creation failed: {e}")
    
    # 2. Seamless Sandbox Simulator Mode (Instant testing for development)
    simulated_session_id = f"sim_cs_{int(time.time())}_{current_user['id']}"
    return {
        "checkout_url": f"http://localhost:3000?session_id={simulated_session_id}&plan_id={plan['id']}&checkout=success",
        "session_id": simulated_session_id,
        "mode": "simulator",
        "plan": plan,
        "message": "Stripe test sandbox session initialized."
    }

@app.post("/api/v1/subscription/verify-session", tags=["Subscription"])
async def verify_checkout_session(
    payload: VerifySessionRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Verify completed Stripe payment session and upgrade user tier in PostgreSQL with Raw SQL.
    """
    plan_id = payload.plan_id.lower()
    if plan_id not in ["pro", "enterprise"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan ID."
        )

    customer_id = None
    sub_id = payload.session_id
    if STRIPE_SECRET_KEY and not payload.session_id.startswith("sim_"):
        try:
            stripe_session = stripe.checkout.Session.retrieve(payload.session_id)
            if stripe_session.payment_status not in ["paid", "no_payment_required"]:
                raise HTTPException(
                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                    detail="Payment has not been completed."
                )
            customer_id = stripe_session.get("customer")
            sub_id = stripe_session.get("subscription") or payload.session_id
        except Exception as e:
            print(f"[!] Stripe retrieval notice: {e}")

    updated = raw_update_user_subscription(
        user_id=current_user["id"],
        tier=plan_id,
        stripe_customer_id=customer_id or f"cus_{current_user['id']}",
        stripe_subscription_id=sub_id
    )

    if not updated:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update subscription in database."
        )

    new_token = create_access_token(
        user_id=current_user["id"],
        username=current_user["username"],
        role=current_user["role"],
        subscription_tier=plan_id
    )

    return {
        "status": "success",
        "message": f"Successfully upgraded to {plan_id.upper()} subscription!",
        "subscription_tier": plan_id,
        "token": new_token,
        "user": {
            "id": current_user["id"],
            "username": current_user["username"],
            "email": current_user["email"],
            "role": current_user["role"],
            "subscription_tier": plan_id
        }
    }

@app.post("/api/v1/subscription/cancel", tags=["Subscription"])
async def cancel_subscription(current_user: dict = Depends(get_current_user)):
    """Cancel subscription and downgrade account to free tier."""
    raw_update_user_subscription(
        user_id=current_user["id"],
        tier="free",
        stripe_customer_id=None,
        stripe_subscription_id=None
    )
    new_token = create_access_token(
        user_id=current_user["id"],
        username=current_user["username"],
        role=current_user["role"],
        subscription_tier="free"
    )
    return {
        "status": "cancelled",
        "subscription_tier": "free",
        "token": new_token,
        "message": "Subscription cancelled. Account reverted to Free Tier (20 daily checks)."
    }

@app.post("/api/v1/subscription/webhook", tags=["Subscription"])
async def stripe_webhook(request: Request):
    """Handle Stripe asynchronous webhook events."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET", "")

    event = None
    if webhook_secret and sig_header:
        try:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    else:
        try:
            import json
            event = json.loads(payload.decode("utf-8"))
        except Exception:
            return {"status": "ignored"}

    event_type = event.get("type") if isinstance(event, dict) else getattr(event, "type", None)
    if event_type == "checkout.session.completed":
        session_data = event.get("data", {}).get("object", {}) if isinstance(event, dict) else event.data.object
        user_id = session_data.get("metadata", {}).get("user_id") or session_data.get("client_reference_id")
        plan_id = session_data.get("metadata", {}).get("plan_id", "pro")
        if user_id:
            try:
                raw_update_user_subscription(
                    user_id=int(user_id),
                    tier=plan_id,
                    stripe_customer_id=session_data.get("customer"),
                    stripe_subscription_id=session_data.get("subscription")
                )
            except Exception as err:
                print(f"[!] Webhook DB update error: {err}")

    return {"status": "received"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
