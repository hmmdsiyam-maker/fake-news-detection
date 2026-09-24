# Fake News Detection - Machine Learning & NLP Capstone

A modular Machine Learning and Natural Language Processing project designed to detect and classify fake or misleading news articles. Built with a production-ready structure for model experimentation, modular training scripts, FastAPI REST backend, and web frontend integration.

---

## 📁 Project Structure

```text
fake-news-ml/
├── app/                  # FastAPI REST API Backend
│   ├── __init__.py
│   └── main.py           # API endpoints, CORS, pipeline, & inference handler
├── data/                 # Raw and processed datasets (.csv)
│   └── Dataset.csv       # WELFake dataset (72,134 records)
├── models/               # Serialized trained models & vectorizers (.pkl)
│   ├── fake_news_model.pkl    # Champion classifier (PassiveAggressive: 96.87% acc)
│   └── tfidf_vectorizer.pkl   # TF-IDF unigram+bigram vectorizer (50k features)
├── notebooks/            # Jupyter Notebooks for EDA, feature engineering, and model training
│   └── 01_model_training.ipynb
├── scripts/              # Modular Python scripts for preprocessing, training, and utilities
│   ├── setup_nltk.py     # Script to download essential NLTK NLP corpora & models
│   └── train.py          # CLI model training pipeline script
├── venv/                 # Python isolated virtual environment
├── requirements.txt      # Project dependencies
└── README.md             # Project documentation and setup guide
```

---

## 🚀 Environment Setup

### 1. Prerequisites
- Python 3.10+ (Python 3.11/3.12/3.14 compatible)
- PowerShell (Windows) or Bash (Linux/macOS)

### 2. Virtual Environment Setup & Activation

On Windows (PowerShell):
```powershell
# Navigate into project directory
cd fake-news-ml

# Create virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
.\venv\Scripts\Activate.ps1
```

On Linux / macOS:
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```powershell
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Download NLP Corpora (NLTK Resources)
Download required corpora (`stopwords`, `punkt`, `wordnet`):
```powershell
python scripts/setup_nltk.py
```

---

## 🏋️ Model Training

Run the modular end-to-end training pipeline:
```powershell
python scripts/train.py
```
This script cleans the missing values in `data/Dataset.csv`, preprocesses articles using cached NLTK lemmatization, fits a 50,000-feature TF-IDF vectorizer, trains Logistic Regression and PassiveAggressiveClassifier, and exports the winning model to `models/fake_news_model.pkl`.

To train interactively, launch Jupyter:
```powershell
jupyter notebook
```
and open `notebooks/01_model_training.ipynb`.

---

## 🌐 Running the FastAPI Server

Launch the Uvicorn web server:
```powershell
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Interactive API Documentation is available at:
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### REST Endpoints:

#### 1. Health Check
`GET http://127.0.0.1:8000/`

#### 2. Predict Fake / Real News
`POST http://127.0.0.1:8000/api/v1/predict`

**Request Body:**
```json
{
  "title": "US Senate passes bipartisan funding bill",
  "text": "WASHINGTON (Reuters) - The United States Senate approved a funding package to prevent a government shutdown."
}
```

**Response Body:**
```json
{
  "prediction": "Real News",
  "label": 0,
  "confidence": 98.71,
  "status": "success"
}
```

---

## 🛠️ Tech Stack & Dependencies
- **Data Manipulation**: `pandas`, `numpy`
- **Machine Learning**: `scikit-learn`, `joblib`
- **Natural Language Processing**: `nltk`
- **Visualization**: `matplotlib`, `seaborn`
- **Exploration**: `jupyter`
- **API Backend**: `fastapi`, `uvicorn`, `pydantic`
