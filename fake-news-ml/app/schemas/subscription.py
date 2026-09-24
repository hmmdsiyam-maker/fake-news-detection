"""
schemas/subscription.py
-----------------------
Stripe payment and subscription schemas.
"""

from pydantic import BaseModel
from typing import Optional

class CreateCheckoutRequest(BaseModel):
    plan_id: str
    success_url: Optional[str] = None
    cancel_url: Optional[str] = None

class VerifySessionRequest(BaseModel):
    session_id: str
    plan_id: str
