# Hotel Dynamic Pricing

A full-stack machine learning application that predicts optimal hotel room prices based on booking characteristics, demand signals, and seasonal patterns. Built with a scikit-learn Random Forest model, a FastAPI backend, and a React frontend.

![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![Scikit-learn](https://img.shields.io/badge/Scikit--learn-1.6-F7931E?style=flat&logo=scikit-learn&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Running the Backend](#running-the-backend)
- [Running the Frontend](#running-thefrontend)
- [ML Model](#ml-model)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Future Improvements](#future-improvements)
- [License](#license)

---

## Project Overview

Hotel Dynamic Pricing helps hotel operators make data-driven pricing decisions by predicting the Average Daily Rate (ADR) for room bookings. The system combines a machine learning regression model with a rule-based demand scoring engine to produce:

1. **ML-predicted price** -- a baseline price from a trained Random Forest model
2. **Demand tier** -- a classification (Very Low to Very High) from a multi-factor scoring algorithm
3. **Recommended price** -- the predicted price adjusted by demand-based multipliers
4. **Pricing reason** -- a human-readable explanation of why the price was set

The application is trained on the [Hotel Booking Demand Dataset](https://www.sciencedirect.com/science/article/pii/S2352340918315191) (Antonio, Almeida, Nunes, 2019) containing 119,390 booking records.

---

## Features

### Backend
- **Price Prediction** -- ML-based room price prediction from 16 booking features
- **Demand Classification** -- rule-based scoring across lead time, season, market segment, customer type, deposits, and special requests
- **Demand Score API** -- standalone endpoint returning a 0-100 demand score with per-factor breakdown
- **Pricing Explanation** -- generates human-readable reasoning for each price recommendation
- **Prediction CRUD** -- full Create, Read, Update, Delete with PostgreSQL persistence
- **Health Check** -- `/health` endpoint for uptime monitoring
- **Alembic Migrations** -- database schema version control
- **Production Ready** -- Gunicorn/Uvicorn, connection pooling, CORS, structured logging

### Frontend
- **Prediction Form** -- 16-field form with client-side validation, grouped into Stay Details, Guests, and Booking Options
- **Price Display Card** -- shows ML predicted price, recommended price, and color-coded demand tier badge
- **Prediction History** -- sortable table with inline edit (modal) and delete (confirmation dialog)
- **Dashboard Stats** -- total predictions, latest price, average lead time
- **Loading States** -- skeleton shimmer animations during data fetches
- **404 Page** -- custom not-found page with navigation back to home
- **Responsive Design** -- mobile-friendly layout with Tailwind CSS

### ML Pipeline
- Data exploration, cleaning, and duplicate analysis
- Feature engineering with one-hot encoding (249 features)
- Model training and evaluation (Linear Regression, Random Forest, Gradient Boosting)
- Automated model selection by R2 score

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                      Frontend (Vercel)                    │
│                                                          │
│  React 19 ─── Vite ─── Tailwind CSS ─── Axios           │
│      │                                                   │
│      ├── / (Home) ─── PredictionForm ─── PriceCard       │
│      ├── /history ─── HistoryTable ─── EditModal         │
│      └── * ─── NotFound                                  │
└──────────────────────┬───────────────────────────────────┘
                       │ REST API (JSON)
                       ▼
┌──────────────────────────────────────────────────────────┐
│                    Backend (Render)                       │
│                                                          │
│  FastAPI ─── Gunicorn + Uvicorn                          │
│      │                                                   │
│      ├── /predict ────────── services.py ──► ML Model    │
│      │                    (demand tiers)    (joblib)     │
│      │                    (recommended price)            │
│      │                    (pricing reason)               │
│      ├── /predictions ────── SQLAlchemy ──── PostgreSQL  │
│      ├── /demand-score ───── demand_scoring.py           │
│      └── /health                                        │
└──────────────────────┬───────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────┐
│                     Database                             │
│                                                          │
│  PostgreSQL ─── predictions table (19 columns)           │
│  Alembic ─── schema migrations                           │
└──────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Backend
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | FastAPI | 0.139.0 |
| Server | Gunicorn + Uvicorn | 23.0.0 / 0.51.0 |
| ORM | SQLAlchemy | 2.0.51 |
| Migrations | Alembic | 1.18.5 |
| Validation | Pydantic | 2.13.4 |
| ML | Scikit-learn | 1.9.0 |
| Data | Pandas / NumPy | 3.0.3 / 2.5.1 |
| Database | PostgreSQL (psycopg2) | 2.9.12 |

### Frontend
| Component | Technology | Version |
|-----------|-----------|---------|
| UI Library | React | 19.2.7 |
| Routing | React Router | 7.18.1 |
| Bundler | Vite | 8.1.1 |
| Styling | Tailwind CSS | 4.3.2 |
| HTTP Client | Axios | 1.18.1 |

### Deployment
| Service | Purpose |
|---------|---------|
| [Render](https://render.com) | Backend API hosting |
| [Vercel](https://vercel.com) | Frontend static hosting |
| Git LFS | ML model file storage (440 MB) |

---

## Installation

### Prerequisites

- Python 3.12+
- Node.js 18+
- PostgreSQL 14+
- Git LFS (`git lfs install`)

### Clone the Repository

```bash
git clone https://github.com/FiraolNigusse/hotel-dynamic-pricing.git
cd hotel-dynamic-pricing
```

### Pull the ML Model (Git LFS)

```bash
git lfs pull
```

### Backend Setup

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/hotel_pricing
```

Run database migrations:

```bash
alembic upgrade head
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://127.0.0.1:8000
```

---

## Running the Backend

```bash
# From the project root
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at:

- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

## Running the Frontend

```bash
cd frontend
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

---

## ML Model

### Overview

| Detail | Value |
|--------|-------|
| Algorithm | Random Forest Regressor (100 estimators) |
| Target | ADR (Average Daily Rate) |
| Training Samples | 85,617 (after cleaning) |
| Features | 249 (after one-hot encoding) |
| R2 Score | 0.873 |
| MAE | $10.53 |
| RMSE | $18.01 |

### How It Works

1. **Input**: 16 booking features (lead time, month, guests, room type, etc.)
2. **Feature Engineering**: computes `total_nights`, `total_guests`, `has_weekend_stay`, `is_peak_season`, `arrival_month`, and one-hot encodes categorical variables
3. **Prediction**: Random Forest predicts the base ADR
4. **Demand Scoring**: a rule-based algorithm classifies demand into 5 tiers based on lead time, season, market segment, customer type, deposit type, adults, and special requests
5. **Price Adjustment**: the predicted price is adjusted by the demand tier multiplier
6. **Explanation**: a human-readable reason is generated from the booking context

### Demand Tier Adjustments

| Tier | Score Range | Price Adjustment |
|------|-------------|-----------------|
| Very High | >= 75 | +25% |
| High | >= 60 | +15% |
| Medium | >= 40 | 0% |
| Low | >= 20 | -10% |
| Very Low | < 20 | -20% |

### Training Pipeline

```bash
# From the project root, with .venv activated
python ml/scripts/clean_data.py
python ml/scripts/feature_engineering.py
python ml/scripts/train_model.py
python ml/scripts/evaluate_model.py
```

The trained model is saved to `ml/models/best_price_model.pkl`.

---

## API Documentation

### Base URL

```
Production:  https://your-app.onrender.com
Development: http://127.0.0.1:8000
```

### Endpoints

#### `GET /health`

Returns server health status.

```json
{
  "status": "healthy",
  "environment": "production",
  "version": "1.0.0"
}
```

---

#### `POST /predict`

Create a new price prediction and persist it to the database.

**Request Body:**

```json
{
  "lead_time": 30,
  "arrival_date_month": "July",
  "stays_in_weekend_nights": 2,
  "stays_in_week_nights": 3,
  "adults": 2,
  "children": 1,
  "babies": 0,
  "meal": "BB",
  "country": "PRT",
  "market_segment": "Online TA",
  "distribution_channel": "TA/TO",
  "reserved_room_type": "A",
  "booking_changes": 0,
  "deposit_type": "No Deposit",
  "customer_type": "Transient",
  "total_of_special_requests": 1
}
```

**Response:**

```json
{
  "predicted_price": 112.50,
  "recommended_price": 129.38,
  "pricing_tier": "High",
  "pricing_reason": "Price has been increased by 15% because demand is elevated during July, and 2 adults are booking."
}
```

---

#### `GET /predictions`

Retrieve all saved predictions, ordered by most recent first.

**Response:**

```json
[
  {
    "id": 1,
    "lead_time": 30,
    "arrival_date_month": "July",
    "stays_in_weekend_nights": 2,
    "stays_in_week_nights": 3,
    "adults": 2,
    "children": 1,
    "babies": 0,
    "meal": "BB",
    "country": "PRT",
    "market_segment": "Online TA",
    "distribution_channel": "TA/TO",
    "reserved_room_type": "A",
    "booking_changes": 0,
    "deposit_type": "No Deposit",
    "customer_type": "Transient",
    "total_of_special_requests": 1,
    "predicted_price": 112.5,
    "created_at": "2025-07-15T10:30:00Z"
  }
]
```

---

#### `PUT /predictions/{prediction_id}`

Update an existing prediction. Recomputes price, demand tier, and recommendation.

**Request Body:** Same as `POST /predict`

**Response:** Same as `POST /predict`

---

#### `DELETE /predictions/{prediction_id}`

Delete a prediction by ID.

**Response:**

```json
{
  "message": "Prediction deleted successfully"
}
```

---

#### `POST /demand-score`

Compute a standalone demand score (0-100) with per-factor breakdown.

**Request Body:**

```json
{
  "lead_time": 7,
  "arrival_date_month": "August",
  "adults": 2,
  "market_segment": "Direct",
  "booking_changes": 0,
  "total_of_special_requests": 2
}
```

**Response:**

```json
{
  "demand_score": 72,
  "demand_level": "High",
  "breakdown": {
    "lead_time": 26,
    "special_requests": 15,
    "adults": 15,
    "market_segment": 15,
    "month": 12,
    "booking_changes": 2
  }
}
```

---

## Deployment

### Backend (Render)

The `render.yaml` blueprint configures the Render service:

```yaml
buildCommand: pip install -r requirements.txt
startCommand: cd backend && alembic upgrade head && gunicorn app.main:app -c ../gunicorn_conf.py
```

**Required environment variables on Render:**

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Render PostgreSQL external URL |
| `CORS_ORIGINS` | `https://your-app.vercel.app` |
| `ENVIRONMENT` | `production` |

### Frontend (Vercel)

Configure in the Vercel dashboard:

| Setting | Value |
|---------|-------|
| Framework | Vite |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| `VITE_API_URL` | `https://your-app.onrender.com` |

The `vercel.json` rewrites all non-asset routes to `index.html` for client-side routing.

### ML Model

The model file (`ml/models/best_price_model.pkl`, ~440 MB) is tracked via **Git LFS**. Clone with:

```bash
git lfs pull
```

---

## Screenshots

<!-- Add screenshots here -->

### Dashboard

<!-- ![Dashboard](screenshots/dashboard.png) -->

### Prediction Form

<!-- ![Prediction Form](screenshots/prediction-form.png) -->

### Price Card

<!-- ![Price Card](screenshots/price-card.png) -->

### History Table

<!-- ![History](screenshots/history.png) -->

---

## Future Improvements

- [ ] **Time-series forecasting** -- incorporate historical occupancy and pricing trends
- [ ] **A/B testing framework** -- compare pricing strategies in production
- [ ] **Bulk prediction API** -- upload CSV files for batch price optimization
- [ ] **User authentication** -- multi-tenant support with role-based access
- [ ] **Monitoring dashboard** -- real-time pricing analytics and model performance tracking
- [ ] **Model retraining pipeline** -- automated retraining on new booking data
- [ ] **Rate limiting** -- API throttling for production traffic management
- [ ] **Integration tests** -- end-to-end test suite for API and frontend

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
