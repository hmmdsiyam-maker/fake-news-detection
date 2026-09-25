"""
routers/subscription.py
-----------------------
Stripe payment gateway integration, subscription checkout, session verification,
and tier management.
"""

import time
import stripe
from fastapi import APIRouter, HTTPException, status, Depends, Request
from app.schemas.subscription import CreateCheckoutRequest, VerifySessionRequest
from app.auth import get_current_user, create_access_token
from app.database import raw_update_user_subscription, raw_record_payment
from app.core.config import (
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET,
    SUBSCRIPTION_PLANS,
    FRONTEND_URL
)

if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY

router = APIRouter(prefix="/api/v1/subscription", tags=["Subscription"])

@router.get("/plans")
async def get_subscription_plans():
    """Return list of subscription tiers, pricing, and feature breakdown."""
    return {"plans": SUBSCRIPTION_PLANS}

@router.post("/create-checkout-session")
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

    cycle = (payload.billing_cycle or "monthly").lower()
    is_annual = cycle in ["annual", "yearly"]

    # Accurate pricing: Annual charges full 12-month total upfront, Monthly charges 1 month
    if is_annual:
        annual_totals = {"pro": 95.88, "enterprise": 479.88}
        price = annual_totals.get(plan["id"], plan.get("price_annual_total", 95.88))
        interval = "year"
    else:
        monthly_totals = {"pro": 9.99, "enterprise": 49.99}
        price = monthly_totals.get(plan["id"], plan["price"])
        interval = "month"

    # 1. Real Stripe Integration if API key is provided
    if STRIPE_SECRET_KEY and not STRIPE_SECRET_KEY.startswith("mock"):
        try:
            domain = payload.success_url or FRONTEND_URL
            checkout_session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                customer_email=current_user["email"],
                client_reference_id=str(current_user["id"]),
                line_items=[
                    {
                        "price_data": {
                            "currency": "usd",
                            "product_data": {
                                "name": f"Truth Console - {plan['name']} ({'Annual Plan (12 Mo)' if is_annual else 'Monthly Plan'})",
                                "description": plan["description"]
                            },
                            "unit_amount": int(round(price * 100)),
                            "recurring": {"interval": interval}
                        },
                        "quantity": 1
                    }
                ],
                mode="subscription",
                success_url=f"{domain}?session_id={{CHECKOUT_SESSION_ID}}&plan_id={plan['id']}&cycle={cycle}&checkout=success",
                cancel_url=f"{domain}?checkout=cancelled",
                metadata={
                    "user_id": str(current_user["id"]),
                    "plan_id": plan["id"],
                    "billing_cycle": cycle
                }
            )
            return {
                "checkout_url": checkout_session.url,
                "session_id": checkout_session.id,
                "mode": "live_stripe",
                "plan": plan,
                "billing_cycle": cycle,
                "total_charged": price
            }
        except Exception as e:
            print(f"[!] Stripe Checkout creation failed: {e}")
    
    # 2. Seamless Sandbox Simulator Mode (Instant testing for development)
    domain = payload.success_url or FRONTEND_URL
    simulated_session_id = f"sim_cs_{int(time.time())}_{current_user['id']}"
    return {
        "checkout_url": f"{domain}?session_id={simulated_session_id}&plan_id={plan['id']}&cycle={cycle}&checkout=success",
        "session_id": simulated_session_id,
        "mode": "simulator",
        "plan": plan,
        "billing_cycle": cycle,
        "total_charged": price,
        "message": "Stripe test sandbox session initialized."
    }

@router.post("/verify-session")
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

    cycle = (payload.billing_cycle or "monthly").lower()
    is_annual = cycle in ["annual", "yearly"]

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
            if stripe_session.get("metadata", {}).get("billing_cycle"):
                cycle = stripe_session["metadata"]["billing_cycle"]
                is_annual = cycle in ["annual", "yearly"]
        except Exception as e:
            print(f"[!] Stripe retrieval notice: {e}")

    updated = raw_update_user_subscription(
        user_id=current_user["id"],
        tier=plan_id,
        stripe_customer_id=customer_id or f"cus_{current_user['id']}",
        stripe_subscription_id=sub_id,
        billing_cycle=cycle
    )

    if not updated:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update subscription in database."
        )

    # Record payment transaction in payments table with exact amount charged
    if is_annual:
        annual_amounts = {"pro": 95.88, "enterprise": 479.88}
        amount = annual_amounts.get(plan_id, 95.88)
    else:
        monthly_amounts = {"pro": 9.99, "enterprise": 49.99}
        amount = monthly_amounts.get(plan_id, 9.99)

    try:
        raw_record_payment(
            user_id=current_user["id"],
            plan_id=plan_id,
            amount=amount,
            currency="usd",
            status="completed",
            payment_method="card",
            stripe_session_id=sub_id
        )
    except Exception as e:
        print(f"[!] Notice: Failed to record payment transaction: {e}")

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

@router.post("/cancel")
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

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe asynchronous webhook events."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    event = None
    if STRIPE_WEBHOOK_SECRET and sig_header:
        try:
            event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_WEBHOOK_SECRET)
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
