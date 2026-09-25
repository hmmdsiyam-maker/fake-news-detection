"""
services/gemini_service.py
--------------------------
Integration with Google Gemini AI for generative fact-checking,
linguistic forensics, and context verification.
"""

import json
import logging
from typing import Optional, Dict, Any
from app.core.config import GEMINI_API_KEY, GEMINI_MODEL

logger = logging.getLogger(__name__)

# Try to initialize the Gemini client
_client = None
if GEMINI_API_KEY and GEMINI_API_KEY.strip():
    try:
        from google import genai
        _client = genai.Client(api_key=GEMINI_API_KEY.strip())
        logger.info(f"Google Gemini client initialized successfully with model: {GEMINI_MODEL}")
    except Exception as e:
        logger.warning(f"Failed to initialize Google Gemini client: {e}")
        _client = None


def get_gemini_client():
    global _client
    if _client is not None:
        return _client
    
    # Check if API key was added dynamically
    import os
    dynamic_key = os.getenv("GEMINI_API_KEY", "").strip() or GEMINI_API_KEY.strip()
    if dynamic_key:
        try:
            from google import genai
            _client = genai.Client(api_key=dynamic_key)
            return _client
        except Exception as e:
            logger.warning(f"Failed to initialize Google Gemini client on demand: {e}")
    return None


def analyze_with_gemini(
    title: str,
    text: str,
    ml_prediction: str,
    ml_confidence: float
) -> Dict[str, Any]:
    """
    Run deep fact-checking and forensic breakdown using Google Gemini.
    Returns structured explanation, verdict, and key analytical points.
    Gracefully falls back if Gemini is not configured or encounters errors.
    """
    client = get_gemini_client()
    if not client:
        return {
            "enabled": False,
            "verdict": None,
            "summary": "Gemini AI deep reasoning is currently disabled. Configure GEMINI_API_KEY in your environment to enable real-time generative fact-checking.",
            "key_points": [],
            "model_used": None
        }

    claim = f"Headline: {title}\nBody: {text}".strip()
    
    prompt = f"""You are Veritas AI, an elite disinformation analyst and forensic investigative journalist.
A machine learning classification model analyzed the following news content:
- ML Prediction: {ml_prediction} News ({ml_confidence:.1f}% confidence)

News Claim to investigate:
\"\"\"
{claim}
\"\"\"

Please conduct an objective, forensic fact-check analysis and return ONLY a valid JSON object matching this schema:
{{
  "verdict": "Likely Authentic" | "Verified Disinformation" | "Misleading / Satire" | "Unverified Claim",
  "summary": "A 2 to 3 sentence concise, objective summary explaining the context, credibility, and truthfulness of this claim.",
  "key_points": [
    "Key forensic signal 1 (e.g. known dateline, factual consistency, verified entity)",
    "Key forensic signal 2 (e.g. sensationalism, emotional priming, lack of credible attribution)",
    "Key forensic signal 3 (e.g. public consensus or fact-checking status from AP/Reuters/Snopes)"
  ]
}}
Do not include markdown code fences or extra text, just raw JSON.
"""

    model_name = GEMINI_MODEL or "gemini-2.5-flash"

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
        )

        response_text = ""
        if hasattr(response, "text") and response.text:
            response_text = response.text.strip()
        elif hasattr(response, "candidates") and response.candidates:
            parts = response.candidates[0].content.parts
            response_text = "".join(p.text for p in parts if hasattr(p, "text")).strip()

        # Clean JSON fences if model enclosed them
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        elif response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()

        data = json.loads(response_text)
        return {
            "enabled": True,
            "verdict": data.get("verdict", "Analyzed"),
            "summary": data.get("summary", ""),
            "key_points": data.get("key_points", []),
            "model_used": model_name
        }
    except Exception as e:
        logger.error(f"Gemini generation error: {e}")
        return {
            "enabled": False,
            "verdict": None,
            "summary": f"Gemini analysis temporarily unavailable: {str(e)}",
            "key_points": [],
            "model_used": model_name,
            "error": str(e)
        }
