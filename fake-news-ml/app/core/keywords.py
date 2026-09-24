"""
core/keywords.py
----------------
Extracts the most influential TF-IDF weighted keywords from article text.
Used for frontend keyword highlighting in verdict cards.
"""

import re
from typing import List, Optional

_URL_REGEX = re.compile(r"https?://\S+|www\.\S+|<.*?>")
_CLEAN_REGEX = re.compile(r"[^a-zA-Z\s]")

# Common disinformation signal words (boost these)
_FAKE_SIGNAL_WORDS = {
    "breaking", "urgent", "shocking", "explosive", "bombshell", "leaked",
    "secret", "expose", "conspiracy", "hoax", "fraud", "fake", "lie",
    "corrupt", "scandal", "betrayal", "coverup", "censored", "banned",
    "hidden", "never told", "illuminati", "globalist", "deep state",
    "doctors hate", "miracle", "cure", "banned cure", "suppressed"
}


def extract_top_keywords(
    title: str,
    text: str,
    vectorizer=None,
    n_keywords: int = 10
) -> List[str]:
    """
    Extract top keywords from article using TF-IDF vocabulary scores.
    Falls back to frequency-based extraction if vectorizer is unavailable.
    """
    combined = f"{title or ''} {text or ''}".strip()
    if not combined:
        return []

    # Clean text
    combined_clean = _CLEAN_REGEX.sub(" ", _URL_REGEX.sub(" ", combined.lower()))
    tokens = [t.strip() for t in combined_clean.split() if len(t.strip()) > 3]

    if vectorizer is not None:
        try:
            vocab = vectorizer.vocabulary_
            idf = getattr(vectorizer, "idf_", {})
            # Score tokens by their TF-IDF IDF weight
            scored = []
            seen = set()
            for token in tokens:
                if token in vocab and token not in seen:
                    idx = vocab[token]
                    idf_score = float(idf[idx]) if hasattr(idf, "__getitem__") else 1.0
                    # Boost fake signal words
                    boost = 1.5 if token in _FAKE_SIGNAL_WORDS else 1.0
                    scored.append((token, idf_score * boost))
                    seen.add(token)
            # Sort by score descending
            scored.sort(key=lambda x: x[1], reverse=True)
            return [w for w, _ in scored[:n_keywords]]
        except Exception:
            pass

    # Fallback: frequency-based with stopword filter
    _STOP = {
        "the", "and", "for", "that", "this", "with", "have", "from", "they",
        "said", "will", "been", "were", "are", "was", "has", "not", "but",
        "which", "about", "when", "also", "more", "some", "than", "its",
        "into", "over", "their", "there", "would", "could", "should", "what"
    }
    freq: dict = {}
    for token in tokens:
        if token not in _STOP:
            freq[token] = freq.get(token, 0) + 1
    sorted_tokens = sorted(freq, key=lambda t: freq[t], reverse=True)
    return sorted_tokens[:n_keywords]
