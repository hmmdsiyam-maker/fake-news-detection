# Fake News Detection - Full-Stack Capstone Project

🚀 **Live Demo:** [https://fake-news-detection-nine-zeta.vercel.app/](https://fake-news-detection-nine-zeta.vercel.app/)

An end-to-end Machine Learning and Natural Language Processing system for real-time fake news classification, featuring a high-performance FastAPI backend and a modern Next.js interactive web dashboard.

---

## 🏛️ System Architecture

```text
fake news detection/
├── fake-news-ml/                 # Machine Learning & Backend Service
│   ├── app/                      # FastAPI REST API application
│   │   ├── __init__.py
│   │   └── main.py               # REST endpoints (/api/v1/predict, /health)
│   ├── data/                     # WELFake Dataset (72,134 news records)
│   │   └── Dataset.csv
│   ├── models/                   # Serialized ML artifacts (.pkl)
│   │   ├── fake_news_model.pkl   # Champion Classifier (PassiveAggressive: 96.87% acc)
│   │   └── tfidf_vectorizer.pkl  # TF-IDF Vectorizer (50k n-grams)
│   ├── notebooks/                # Jupyter Notebooks
│   │   └── 01_model_training.ipynb
│   ├── scripts/                  # Modular Python scripts
│   │   ├── setup_nltk.py         # NLTK resources setup
│   │   └── train.py              # CLI training pipeline
│   ├── venv/                     # Python 3.14 virtual environment
│   └── requirements.txt
│
└── fake-news-ui/                 # Frontend Web Dashboard
    ├── src/
    │   └── app/
    │       ├── globals.css       # Tailwind CSS styling & animations
    │       ├── layout.tsx        # Layout & theme configuration
    │       └── page.tsx          # Real-time interactive detection dashboard
    ├── package.json
    └── tsconfig.json
```

---

## 🚀 Running the Full Stack

### 1. Backend (FastAPI & Uvicorn)
```powershell
cd fake-news-ml
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- **API URL**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Frontend (Next.js & Tailwind CSS)
```powershell
cd fake-news-ui
npm run dev -- -p 3000
```
- **Web Dashboard**: [http://localhost:3000](http://localhost:3000)

---

## 📊 Model & Benchmark Summary
- **Dataset**: WELFake (72,134 news articles: 35,028 real, 37,106 fake)
- **Model**: PassiveAggressiveClassifier (Loss: Hinge)
- **Test Accuracy**: **96.87%**
- **Inference Latency**: Sub-25ms per article
