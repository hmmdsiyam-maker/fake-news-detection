"""
routers/auth.py
---------------
Authentication endpoints: register, login, and profile fetching.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.auth import RegisterRequest, LoginRequest, AuthResponse
from app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)
from app.database import (
    raw_create_user,
    raw_get_user_by_username,
    raw_get_user_by_email,
    raw_update_last_login,
    raw_get_user_today_prediction_count
)
from app.core.config import DAILY_FREE_LIMIT

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

@router.post("/register", response_model=AuthResponse)
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

@router.post("/login", response_model=AuthResponse)
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

@router.get("/me")
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
        "today_prediction_count": today_count,
        "daily_limit": "unlimited" if is_unlimited else DAILY_FREE_LIMIT,
        "today_remaining": remaining,
        "created_at": current_user["created_at"],
        "last_login": current_user["last_login"]
    }
