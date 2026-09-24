# 🛡️ Veritas - Enterprise AI Fake News Detection SaaS

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql)
![Stripe](https://img.shields.io/badge/Stripe-Integration-635BFF?style=for-the-badge&logo=stripe)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-Machine_Learning-F7931E?style=for-the-badge&logo=scikit-learn)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC?style=for-the-badge&logo=tailwind-css)

🚀 **Live Web App:** [https://fake-news-detection-nine-zeta.vercel.app](https://fake-news-detection-nine-zeta.vercel.app)  
📡 **Live API Docs (Swagger):** [https://fake-news-detection-uzl5.onrender.com/docs](https://fake-news-detection-u7l5.onrender.com/docs)  

**Veritas** is a production-ready, full-stack Machine Learning SaaS platform designed to detect fabricated news articles and misinformation in real-time. Built with a high-performance **FastAPI** Python backend and a beautiful, responsive **Next.js** frontend featuring glassmorphism and modern UI/UX principles.

---

## ✨ Key Features

- **🧠 Real-Time ML Inference:** Sub-25ms classification using a highly optimized PassiveAggressive Classifier trained on 72,000+ articles (96.8% Accuracy).
- **💳 SaaS & Subscriptions:** Full Stripe payment integration for Free, Pro, and Enterprise tiers (Sandbox simulator included).
- **📊 Admin Dashboard:** Secure admin panel with real-time KPI metrics, revenue tracking (MRR), and user management.
- **🔐 Authentication & Security:** Secure JWT-based authentication and role-based access control (RBAC).
- **💾 Relational Database:** Robust PostgreSQL integration using raw SQL for high-performance CRUD and telemetry logging.
- **📖 Developer API:** Public developer API with extensive Swagger documentation and code snippets.
- **📱 Responsive UI:** Fully responsive mobile-first design with Dark/Light mode support and stunning micro-animations.

---

## 🛠️ Technology Stack

| Category | Technologies Used |
| :--- | :--- |
| **Frontend** | Next.js (React), TypeScript, Tailwind CSS, Lucide Icons, GSAP (Animations) |
| **Backend** | FastAPI, Python 3.10+, Uvicorn, Passlib (Bcrypt), PyJWT |
| **Database** | PostgreSQL, Raw SQL (psycopg2-binary) |
| **Machine Learning**| Scikit-learn (TF-IDF Vectorizer, PassiveAggressiveClassifier), Pandas, NLTK |
| **Monetization** | Stripe API, Stripe Checkout Sessions |
| **Deployment** | Vercel (Frontend), Render (Backend), NeonDB (Database) |

---

## 🚀 Quick Setup (Automated)

We have provided a unified PowerShell setup script that completely bootstraps the project on any Windows machine. It handles environment variables, node modules, and python virtual environments automatically.

1. **Clone the repository:**
   ```bash
   git clone https://github.com/siyam-io/fake-news-detection.git
   cd fake-news-detection
   ```

2. **Run the Setup Script:**
   ```powershell
   .\setup.ps1
   ```
   *(This will create `.env` files, run `npm install` for the UI, and set up a Python `venv` for the ML backend.)*

---

## ⚙️ Manual Setup & Running

If you prefer to set up the environments manually or are not on Windows:

### 1. Backend (FastAPI & Machine Learning)
```bash
cd fake-news-ml

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- **API URL**: `http://127.0.0.1:8000`
- **Swagger Docs**: `http://127.0.0.1:8000/docs`

### 2. Frontend (Next.js)
```bash
cd fake-news-ui

# Install dependencies
npm install

# Start development server
npm run dev
```
- **Web Dashboard**: `http://localhost:3000`

---

## 🔑 Environment Variables Configuration

The `.env` files are generated from their `.example` counterparts. Be sure to configure them with your actual keys before deploying.

### `fake-news-ui/.env` (Frontend)
```env
NEXT_PUBLIC_API_URL=https://your-fastapi-backend.onrender.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### `fake-news-ml/.env` (Backend)
```env
DATABASE_URL=postgresql://user:password@host:port/dbname?sslmode=require
JWT_SECRET_KEY=your-super-secret-key
STRIPE_SECRET_KEY=sk_test_...
FRONTEND_URL=https://your-vercel-domain.vercel.app
```

---

## 📈 ML Model Benchmark Summary
- **Dataset**: WELFake (72,134 news articles: 35,028 real, 37,106 fake)
- **Model**: PassiveAggressiveClassifier (Loss: Hinge)
- **Feature Extraction**: TF-IDF Vectorizer (50,000 max features, ngram_range=(1,2))
- **Test Accuracy**: **96.87%**
- **Inference Latency**: Sub-25ms per article

---

## 🗂️ Project Architecture

```text
fake-news-detection/
├── fake-news-ml/                 # Machine Learning & Backend Service
│   ├── app/                      # FastAPI application
│   │   ├── routers/              # API Endpoints (Admin, Auth, Blog, Predict, Subscription)
│   │   ├── core/                 # Config & Security
│   │   ├── models.py             # Pydantic schemas
│   │   └── database.py           # PostgreSQL Raw SQL queries
│   ├── models/                   # Serialized ML artifacts (.pkl)
│   ├── scripts/                  # CLI training pipeline
│   └── requirements.txt          # Python dependencies
│
├── fake-news-ui/                 # Frontend Next.js Dashboard
│   ├── src/
│   │   ├── app/                  # Next.js App Router Pages (Admin, Pricing, Docs, etc.)
│   │   ├── components/           # Reusable UI Components
│   │   ├── context/              # React Context (State Management)
│   │   └── lib/                  # API client & Utilities
│   └── package.json              # Node dependencies
│
└── setup.ps1                     # Unified bootstrap script
```

---

## 🛡️ License & Copyright

© 2026 Veritas Research. All Rights Reserved.  
Built for the purpose of combating digital misinformation using AI.
