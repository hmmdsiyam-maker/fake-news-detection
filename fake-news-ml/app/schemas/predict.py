"""
schemas/predict.py
------------------
Prediction request and response schemas.
"""

from pydantic import BaseModel, Field
from typing import Optional, List

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
    top_keywords: List[str] = []
