"""
core/config.py
--------------
Centralized environment variables, system limits, and runtime settings.
"""

import os
from collections import defaultdict

# --- System & Model Settings ---
APP_NAME = "AI Fake News Truth Console API"
APP_VERSION = "2.0.0"

# --- Usage Quota Limits ---
GUEST_USAGE_LIMIT = int(os.getenv("GUEST_USAGE_LIMIT", "5"))
DAILY_FREE_LIMIT = int(os.getenv("DAILY_FREE_LIMIT", "100"))

# In-memory guest usage tracker (per client IP)
guest_usage_tracker = defaultdict(int)

# --- Security & JWT ---
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "fakenews-super-secret-jwt-key-2026-xyz-777")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_SECONDS = 60 * 60 * 24 * 7  # 7 days

# --- Stripe Monetization ---
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")

# --- Subscription Plans Definition ---
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
            "100 Daily AI Verifications (resets every 24h)",
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
            "Unlimited Daily AI Verifications",
            "High-Priority Inference Pipeline (<50ms)",
            "Full Audit History with Re-run & Search",
            "Data Export (CSV & JSON)",
            "Verified Pro Badge on Dashboard",
            "Priority Direct Support"
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
            "Everything in Pro for Entire Newsroom",
            "Dedicated REST API Key & Webhooks",
            "Custom Fine-Tuned Domain Models",
            "99.9% High Availability SLA",
            "24/7 Dedicated Account Engineer"
        ]
    }
]
