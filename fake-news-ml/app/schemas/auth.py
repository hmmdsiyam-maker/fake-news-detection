"""
schemas/auth.py
---------------
Authentication and user profile request/response schemas.
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    email: str = Field(min_length=5, max_length=128)
    password: str = Field(min_length=6, max_length=100)

class LoginRequest(BaseModel):
    username_or_email: str
    password: str

class AuthUserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    subscription_tier: str

class AuthResponse(BaseModel):
    token: str
    refresh_token: Optional[str] = None
    user: Dict[str, Any]

class RefreshRequest(BaseModel):
    refresh_token: str
