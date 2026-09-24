"""
core/nlp.py
-----------
NLP preprocessing pipeline, lemmatization cache, and ML model inference engine.
"""

import os
import re
import math
import time
import joblib
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from typing import Dict, Any, Tuple

# --- Preprocessing Globals & Cache ---
_LEMMA_CACHE: Dict[str, str] = {}
_LEMMATIZER = None
_STOP_WORDS = None
_URL_REGEX = re.compile(r"https?://\S+|www\.\S+|<.*?>")
_CLEAN_REGEX = re.compile(r"[^a-z\s]")

# Global ML Artifacts Store
ml_artifacts: Dict[str, Any] = {
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
        if _LEMMATIZER:
            _LEMMA_CACHE[word] = _LEMMATIZER.lemmatize(word)
        else:
            return word
    return _LEMMA_CACHE[word]

def preprocess_text(text: str) -> str:
    """NLP Preprocessing Pipeline identical to model training."""
    if not isinstance(text, str) or not text.strip():
        return ""
    text = _URL_REGEX.sub(" ", text.lower())
    text = _CLEAN_REGEX.sub(" ", text)
    tokens = text.split()
    if _STOP_WORDS:
        cleaned = [fast_lemmatize(w) for w in tokens if w not in _STOP_WORDS and len(w) > 2]
    else:
        cleaned = [fast_lemmatize(w) for w in tokens if len(w) > 2]
    return " ".join(cleaned)

def load_ml_artifacts(base_dir: str = None) -> bool:
    """Load model.pkl and vectorizer.pkl into memory."""
    if base_dir is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    models_dir = os.path.join(base_dir, "models")
    model_path = os.path.join(models_dir, "fake_news_model.pkl")
    if not os.path.exists(model_path):
        model_path = os.path.join(models_dir, "model.pkl")

    vec_path = os.path.join(models_dir, "tfidf_vectorizer.pkl")
    if not os.path.exists(vec_path):
        vec_path = os.path.join(models_dir, "vectorizer.pkl")

    try:
        if os.path.exists(model_path) and os.path.exists(vec_path):
            ml_artifacts["model"] = joblib.load(model_path)
            ml_artifacts["vectorizer"] = joblib.load(vec_path)
            print("[+] ML model and vectorizer loaded successfully into memory.")
            return True
        else:
            print(f"[!] Warning: Model files not found in {models_dir}. Running without ML inference.")
            return False
    except Exception as e:
        print(f"[!] Failed to load ML artifacts: {e}")
        return False

def run_inference(title: str, text: str) -> Tuple[str, int, float, int]:
    """
    Run classification and confidence calibration.
    Returns: (prediction_label, label_int, confidence_percent, latency_ms)
    """
    model = ml_artifacts.get("model")
    vectorizer = ml_artifacts.get("vectorizer")

    if model is None or vectorizer is None:
        raise RuntimeError("ML model or vectorizer is not loaded in memory.")

    raw_content = f"{title or ''} {text or ''}".strip()
    if not raw_content:
        raise ValueError("No text provided for analysis.")

    start_time = time.perf_counter()

    # Preprocess & Vectorize
    cleaned_content = preprocess_text(raw_content) or raw_content.lower()
    tfidf_features = vectorizer.transform([cleaned_content])

    # Classify
    pred = int(model.predict(tfidf_features)[0])

    # Calibrate Confidence
    if hasattr(model, "decision_function"):
        margin = float(model.decision_function(tfidf_features)[0])
        prob_fake = 1.0 / (1.0 + math.exp(-max(min(margin, 20.0), -20.0)))
        confidence = round((prob_fake if pred == 1 else (1.0 - prob_fake)) * 100.0, 2)
    elif hasattr(model, "predict_proba"):
        probs = model.predict_proba(tfidf_features)[0]
        confidence = round(float(probs[pred]) * 100.0, 2)
    else:
        confidence = 95.0

    confidence = max(confidence, 50.0)
    prediction_label = "Fake News" if pred == 1 else "Real News"
    latency_ms = max(int((time.perf_counter() - start_time) * 1000), 1)

    return prediction_label, pred, confidence, latency_ms
