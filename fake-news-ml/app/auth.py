"""
auth.py
-------
JWT and bcrypt authentication utilities, FastAPI security dependencies,
and default administrator provisioning.
"""

import os
import time
import bcrypt
import jwt
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.database import (
    raw_get_user_by_id,
    raw_get_user_by_username,
    raw_create_user
)

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fakenews-super-secret-jwt-key-2026-xyz-777")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_SECONDS = 60 * 60 * 24 * 7  # 7 days

security_bearer = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    """Hash plaintext password with bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify plaintext password against bcrypt hash."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_access_token(user_id: int, username: str, role: str, subscription_tier: str = "free") -> str:
    """Generate a signed JWT access token."""
    now = int(time.time())
    payload = {
        "sub": str(user_id),
        "username": username,
        "role": role,
        "tier": subscription_tier,
        "iat": now,
        "exp": now + JWT_EXPIRATION_SECONDS
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT access token."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except (jwt.PyJWTError, Exception):
        return None

async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> Optional[dict]:
    """
    Returns user dict if valid Bearer token is provided; otherwise returns None.
    Allows endpoints (like /predict) to be used by both logged-in and guest users.
    """
    if not credentials or not credentials.credentials:
        return None
    
    payload = decode_access_token(credentials.credentials)
    if not payload or "sub" not in payload:
        return None

    try:
        user_id = int(payload["sub"])
        user = raw_get_user_by_id(user_id)
        return user
    except Exception:
        return None

async def get_current_user(
    user: Optional[dict] = Depends(get_current_user_optional)
) -> dict:
    """Requires authentication. Raises 401 if unauthenticated."""
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

async def require_admin(
    current_user: dict = Depends(get_current_user)
) -> dict:
    """Requires user to possess the 'admin' role. Raises 403 otherwise."""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: Administrator privileges required."
        )
    return current_user

def seed_default_admin():
    """Ensure default admin account exists in database upon server startup."""
    admin_user = raw_get_user_by_username("admin")
    if not admin_user:
        print("[*] Provisioning default administrator account ('admin' / 'admin123')...")
        raw_create_user(
            username="admin",
            email="admin@fakenews.ai",
            password_hash=hash_password("admin123"),
            role="admin"
        )
        print("[+] Default administrator ('admin' / 'admin123') provisioned successfully.")
