"""
train.py
--------
Production training script for Fake News Detection using NLP & Machine Learning.
Dataset: WELFake (Dataset.csv)
Pipeline:
  1. Load data & handle missing values
  2. Text preprocessing (cleaning, tokenization, stopword removal, lemmatization)
  3. Feature extraction (TF-IDF Vectorization)
  4. Model training (Logistic Regression & PassiveAggressiveClassifier)
  5. Evaluation (Accuracy, Confusion Matrix, Classification Report)
  6. Artifact persistence (Best Model & TF-IDF Vectorizer to models/*.pkl)
"""

import os
import re
import sys
import time
import joblib
import pandas as pd
import numpy as np

import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression, PassiveAggressiveClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# Global lemmatization cache for high-speed preprocessing
_LEMMA_CACHE = {}
_LEMMATIZER = None
_STOP_WORDS = None
_URL_REGEX = re.compile(r"https?://\S+|www\.\S+|<.*?>")
_CLEAN_REGEX = re.compile(r"[^a-z\s]")

def init_nltk():
    """Ensure required NLTK resources are available."""
    global _LEMMATIZER, _STOP_WORDS
    try:
        _STOP_WORDS = set(stopwords.words("english"))
        _LEMMATIZER = WordNetLemmatizer()
    except LookupError:
        print("[*] Downloading missing NLTK resources...")
        nltk.download("stopwords", quiet=True)
        nltk.download("wordnet", quiet=True)
        nltk.download("omw-1.4", quiet=True)
        _STOP_WORDS = set(stopwords.words("english"))
        _LEMMATIZER = WordNetLemmatizer()

def fast_lemmatize(word: str) -> str:
    """Cached lemmatization to avoid repeated WordNet queries."""
    if word not in _LEMMA_CACHE:
        _LEMMA_CACHE[word] = _LEMMATIZER.lemmatize(word)
    return _LEMMA_CACHE[word]

def preprocess_text(text: str) -> str:
    """
    NLP Preprocessing Pipeline:
      - Lowercase
      - Remove URLs, HTML tags, punctuation & numbers
      - Tokenize by whitespace
      - Remove English stopwords & words shorter than 3 chars
      - Lemmatize tokens
    """
    if not isinstance(text, str) or not text:
        return ""
    text = _URL_REGEX.sub(" ", text.lower())
    text = _CLEAN_REGEX.sub(" ", text)
    tokens = text.split()
    cleaned = [fast_lemmatize(w) for w in tokens if w not in _STOP_WORDS and len(w) > 2]
    return " ".join(cleaned)

def run_training_pipeline():
    init_nltk()

    # Paths
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_path = os.path.join(base_dir, "data", "Dataset.csv")
    models_dir = os.path.join(base_dir, "models")
    os.makedirs(models_dir, exist_ok=True)

    print("=" * 70)
    print("      FAKE NEWS DETECTION - MODEL TRAINING PIPELINE")
    print("=" * 70)

    # 1. Dataset Loading
    if not os.path.exists(data_path):
        print(f"[!] Error: Dataset not found at: {data_path}")
        sys.exit(1)

    print(f"[*] Loading dataset from: {data_path}")
    t0 = time.time()
    df = pd.read_csv(data_path)
    print(f"[+] Loaded {len(df):,} records in {time.time() - t0:.2f} seconds.")
    print(f"[*] Columns found: {list(df.columns)}")

    # 2. Data Cleaning & Handling Missing Values
    print("\n[*] Cleaning missing values...")
    missing_title = df["title"].isnull().sum()
    missing_text = df["text"].isnull().sum()
    print(f"    Missing titles: {missing_title:,} | Missing texts: {missing_text:,}")

    df["title"] = df["title"].fillna("")
    df["text"] = df["text"].fillna("")
    df["content"] = df["title"] + " " + df["text"]

    # Filter out empty content and missing labels
    df = df[df["label"].notnull()]
    df["label"] = df["label"].astype(int)
    df = df[df["content"].str.strip() != ""]
    print(f"[+] Cleaned dataset size: {len(df):,} articles.")
    print(f"    Class distribution: Real (0): {(df['label'] == 0).sum():,} | Fake (1): {(df['label'] == 1).sum():,}")

    # 3. Text Preprocessing
    print("\n[*] Applying NLTK text preprocessing pipeline...")
    t0 = time.time()
    raw_texts = df["content"].tolist()
    preprocessed_texts = [preprocess_text(t) for t in raw_texts]
    df["cleaned_content"] = preprocessed_texts
    print(f"[+] Text preprocessing completed in {time.time() - t0:.2f}s (Cache size: {len(_LEMMA_CACHE):,} words)")

    # 4. Train-Test Split
    print("\n[*] Splitting data into training (80%) and testing (20%) sets...")
    X_train, X_test, y_train, y_test = train_test_split(
        df["cleaned_content"],
        df["label"],
        test_size=0.20,
        random_state=42,
        stratify=df["label"]
    )
    print(f"[+] Training samples: {len(X_train):,} | Testing samples: {len(X_test):,}")

    # 5. TF-IDF Vectorization
    print("\n[*] Fitting TF-IDF Vectorizer (max_features=50,000, ngram_range=(1,2))...")
    t0 = time.time()
    vectorizer = TfidfVectorizer(max_features=50000, ngram_range=(1, 2))
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)
    print(f"[+] TF-IDF transform completed in {time.time() - t0:.2f}s. Matrix shape: {X_train_tfidf.shape}")

    # 6. Model Training & Evaluation
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42, C=1.0),
        "Passive Aggressive Classifier": PassiveAggressiveClassifier(max_iter=1000, random_state=42, C=0.5)
    }

    results = {}

    for name, model in models.items():
        print("\n" + "-" * 70)
        print(f"[*] Training {name}...")
        t_start = time.time()
        model.fit(X_train_tfidf, y_train)
        train_time = time.time() - t_start

        y_pred = model.predict(X_test_tfidf)
        acc = accuracy_score(y_test, y_pred)
        cm = confusion_matrix(y_test, y_pred)
        report = classification_report(y_test, y_pred, target_names=["Real (0)", "Fake (1)"])

        results[name] = {
            "model": model,
            "accuracy": acc,
            "confusion_matrix": cm,
            "report": report,
            "train_time": train_time
        }

        print(f"[+] {name} Training Finished in {train_time:.2f}s")
        print(f"[+] Accuracy: {acc * 100:.2f}%\n")
        print("Confusion Matrix:")
        print(f"               Pred Real (0)  Pred Fake (1)")
        print(f"Act Real (0)       {cm[0][0]:<14} {cm[0][1]}")
        print(f"Act Fake (1)       {cm[1][0]:<14} {cm[1][1]}\n")
        print("Classification Report:")
        print(report)

    # 7. Model Comparison & Artifact Saving
    print("=" * 70)
    print("                    PERFORMANCE COMPARISON")
    print("=" * 70)
    for name, data in results.items():
        print(f" - {name:<30}: {data['accuracy'] * 100:.2f}% accuracy")

    best_name = max(results, key=lambda k: results[k]["accuracy"])
    best_model = results[best_name]["model"]
    best_accuracy = results[best_name]["accuracy"]

    print(f"\n[*] Best Performing Model: {best_name} ({best_accuracy * 100:.2f}% accuracy)")

    model_save_path = os.path.join(models_dir, "fake_news_model.pkl")
    vec_save_path = os.path.join(models_dir, "tfidf_vectorizer.pkl")

    print(f"[*] Saving best model to: {model_save_path}")
    joblib.dump(best_model, model_save_path)

    print(f"[*] Saving TF-IDF vectorizer to: {vec_save_path}")
    joblib.dump(vectorizer, vec_save_path)

    print("\n[SUCCESS] Pipeline execution completed successfully! Artifacts ready for deployment.")

if __name__ == "__main__":
    run_training_pipeline()
