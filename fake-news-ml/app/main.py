"""
main.py
-------
FastAPI REST API backend serving the Fake News Detection ML model.
Endpoints:
  - GET  /                : Root health check & API metadata
  - GET  /health          : Service & model status
  - POST /api/v1/predict  : Inference endpoint (title, text) -> prediction, label, confidence
"""

import os
import re
import math
import joblib
import numpy as np
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

# --- Text Preprocessing Globals & Cache ---
_LEMMA_CACHE = {}
_LEMMATIZER = None
_STOP_WORDS = None
_URL_REGEX = re.compile(r"https?://\S+|www\.\S+|<.*?>")
_CLEAN_REGEX = re.compile(r"[^a-z\s]")

# Global ML Artifacts
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
    """
    NLP Preprocessing Pipeline identical to model training:
      - Lowercase
      - Strip URLs, HTML tags, punctuation & numeric characters
      - Filter stopwords and tokens with length <= 2
      - Lemmatize tokens
    """
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
    """Load model and TF-IDF vectorizer artifacts upon application startup."""
    init_nltk()
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
    # Clean up on shutdown
    ml_artifacts.clear()

# --- FastAPI Initialization ---
app = FastAPI(
    title="Fake News Detection API",
    description="High-performance NLP & Machine Learning REST API for detecting fake and misleading news articles.",
    version="1.0.0",
    lifespan=lifespan
)

# --- CORS Middleware Configuration ---
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Request / Response Schemas ---
class PredictRequest(BaseModel):
    title: Optional[str] = Field(default="", description="Headline or title of the news article")
    text: Optional[str] = Field(default="", description="Body content of the news article")

class PredictResponse(BaseModel):
    prediction: str = Field(description="'Fake News' or 'Real News'")
    label: int = Field(description="1 for Fake News, 0 for Real News")
    confidence: float = Field(description="Prediction confidence percentage (0.0 to 100.0)")
    status: str = Field(default="success", description="Status of the operation")

# --- Endpoints ---
@app.get("/", tags=["Health"])
async def root():
    """Root health check returning service metadata."""
    return {
        "status": "online",
        "service": "Fake News Detection API",
        "version": "1.0.0",
        "endpoints": {
            "predict": "/api/v1/predict",
            "health": "/health",
            "docs": "/docs"
        }
    }

@app.get("/health", tags=["Health"])
async def health():
    """System health check and artifact verification."""
    is_ready = ml_artifacts.get("model") is not None and ml_artifacts.get("vectorizer") is not None
    return {
        "status": "healthy" if is_ready else "degraded",
        "model_loaded": ml_artifacts.get("model") is not None,
        "vectorizer_loaded": ml_artifacts.get("vectorizer") is not None
    }

@app.post(
    "/api/v1/predict",
    response_model=PredictResponse,
    status_code=status.HTTP_200_OK,
    tags=["Inference"]
)
async def predict_news(payload: PredictRequest):
    """
    Predict whether a news article is Fake or Real.
    Accepts:
      - title: Article headline
      - text: Article body text
    Returns:
      - prediction: 'Fake News' | 'Real News'
      - label: 1 | 0
      - confidence: e.g. 96.87
      - status: 'success'
    """
    model = ml_artifacts.get("model")
    vectorizer = ml_artifacts.get("vectorizer")

    if model is None or vectorizer is None:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model artifacts are not loaded. Please ensure models are trained and present in `models/`."
        )

    # Combine title and text
    raw_content = f"{payload.title or ''} {payload.text or ''}".strip()
    if not raw_content:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Both 'title' and 'text' cannot be empty. Please provide text to analyze."
        )

    # Preprocess text
    cleaned_content = preprocess_text(raw_content)
    if not cleaned_content:
        # If words were all filtered (e.g. only symbols)
        cleaned_content = raw_content.lower()

    # TF-IDF Feature Extraction
    tfidf_features = vectorizer.transform([cleaned_content])

    # Inference
    pred = int(model.predict(tfidf_features)[0])

    # Compute calibrated confidence percentage
    if hasattr(model, "decision_function"):
        margin = float(model.decision_function(tfidf_features)[0])
        # Sigmoid calibration: prob of Class 1 (Fake)
        prob_fake = 1.0 / (1.0 + math.exp(-max(min(margin, 20.0), -20.0)))
        if pred == 1:
            confidence = round(prob_fake * 100.0, 2)
        else:
            confidence = round((1.0 - prob_fake) * 100.0, 2)
    elif hasattr(model, "predict_proba"):
        probs = model.predict_proba(tfidf_features)[0]
        confidence = round(float(probs[pred]) * 100.0, 2)
    else:
        confidence = 95.0

    # Ensure confidence is at least 50.0%
    confidence = max(confidence, 50.0)

    prediction_label = "Fake News" if pred == 1 else "Real News"

    return PredictResponse(
        prediction=prediction_label,
        label=pred,
        confidence=confidence,
        status="success"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
