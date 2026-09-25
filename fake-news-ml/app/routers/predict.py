"""
routers/predict.py
------------------
Prediction inference endpoint with guest & daily quota enforcement,
confidence calibration, and Raw SQL audit logging.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends, Request
from app.schemas.predict import PredictRequest, PredictResponse
from app.auth import get_current_user_optional
from app.core.config import GUEST_USAGE_LIMIT, DAILY_FREE_LIMIT, DAILY_PRO_LIMIT, guest_usage_tracker
from app.core.nlp import run_inference, ml_artifacts
from app.core.keywords import extract_top_keywords
from app.core.rate_limit import limiter
from app.database import (
    raw_get_user_today_prediction_count,
    raw_save_history
)
from app.services.gemini_service import analyze_with_gemini

router = APIRouter(prefix="/api/v1", tags=["Inference"])

@router.post("/predict", response_model=PredictResponse)
@limiter.limit("15/minute")
async def predict_news(
    request: Request,
    payload: PredictRequest,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    Predict whether news is Fake or Real.
    If guest (non-logged in): allows exactly 5 free evaluations before requiring authentication.
    If registered user on free tier: allows 20 verifications per day (resets daily at 00:00 UTC).
    If Pro / Enterprise / Admin: unlimited verifications.
    """
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
        is_admin = (role == "admin")
        is_pro = (tier in ["pro", "enterprise"])

        today_count = raw_get_user_today_prediction_count(current_user["id"])
        
        if is_admin:
            daily_remaining = -1
        else:
            applicable_limit = DAILY_PRO_LIMIT if is_pro else DAILY_FREE_LIMIT
            
            if today_count >= applicable_limit:
                raise HTTPException(
                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                    detail=f"Daily limit reached ({applicable_limit}/{applicable_limit} verifications used today)." + 
                           ("" if is_pro else " Upgrade to Pro for 1000 daily verifications.")
                )
            daily_remaining = max(0, applicable_limit - (today_count + 1))

    raw_content = f"{payload.title or ''} {payload.text or ''}".strip()
    if not raw_content:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Please provide an article headline or text to analyze."
        )

    try:
        prediction_label, pred, confidence, latency_ms = run_inference(payload.title or "", payload.text or "")
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model inference failed: {e}"
        )

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

    # Extract top influential keywords
    try:
        top_keywords = extract_top_keywords(
            payload.title or "",
            payload.text or "",
            vectorizer=ml_artifacts.get("vectorizer"),
            n_keywords=12
        )
    except Exception:
        top_keywords = []

    # Deep Fact-Checking & Forensics via Google Gemini
    gemini_analysis = None
    try:
        gemini_analysis = analyze_with_gemini(
            title=payload.title or "",
            text=payload.text or "",
            ml_prediction=prediction_label,
            ml_confidence=confidence
        )
    except Exception as e:
        print(f"[!] Gemini analysis error: {e}")

    return PredictResponse(
        prediction=prediction_label,
        label=pred,
        confidence=confidence,
        latency_ms=latency_ms,
        saved_to_history=saved,
        guest_remaining=guest_remaining,
        daily_remaining=daily_remaining,
        subscription_tier=tier,
        status="success",
        top_keywords=top_keywords,
        gemini_analysis=gemini_analysis
    )
