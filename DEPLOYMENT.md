# 🚀 SIVORA AI E-Commerce - 100% Free-Tier Deployment Guide

This guide details how to deploy the entire full-stack application (FastAPI, React, PostgreSQL, Redis, Celery, and ChromaDB) to the cloud with **$0 monthly spend** using generous free-tier services.

---

## 🏗️ Architecture Overview for Free Hosting

```mermaid
flowchart LR
    Browser["🌐 Shopper & Admin"] --> Vercel["⚡ Vercel / Netlify (Free)<br>React 18 + Vite SPA"]
    Vercel --> Render["🚀 Render.com / Railway (Free)<br>FastAPI + Celery + ChromaDB"]
    Render --> Supabase[("🐘 Supabase / Render PG (Free)<br>Managed PostgreSQL Database")]
    Render --> Upstash[("⚡ Upstash Redis (Free)<br>Serverless Redis Cache & Celery Broker")]
    Render --> FreeLLM["🤖 Groq & Google Gemini (Free)<br>LLaMA-3.3 70B & Gemini Flash APIs"]
```

---

## 1. Database Deployment: Managed PostgreSQL (Supabase / Render)

### Option A: Supabase (Recommended - 500MB Free)
1. Go to [supabase.com](https://supabase.com) and create a free project named `sivora-ecommerce`.
2. Under **Project Settings ➔ Database**, copy your `Transaction Pooler` connection string:
   ```env
   DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres"
   ```
3. Run the schema migrations or seed script:
   ```bash
   python scripts/seed_sivora_fashion.py
   ```

---

## 2. Cache & Message Broker: Serverless Redis (Upstash)

1. Go to [upstash.com](https://upstash.com) and create a free Redis database (10,000 requests/day free).
2. Copy your standard Redis URI:
   ```env
   REDIS_URL="rediss://default:[password]@[endpoint].upstash.io:6379"
   CELERY_BROKER_URL="rediss://default:[password]@[endpoint].upstash.io:6379/1"
   CELERY_RESULT_BACKEND="rediss://default:[password]@[endpoint].upstash.io:6379/2"
   ```

---

## 3. Backend API Deployment: FastAPI (Render.com / Railway)

1. Go to [render.com](https://render.com) and click **New + ➔ Web Service**.
2. Connect your GitHub repository.
3. Select **Docker** as Runtime (it automatically detects `backend/Dockerfile`), or choose Python:
   - **Root Directory**: `22_ai_focus/backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Configure **Environment Variables**:
   ```env
   ENVIRONMENT=production
   DEBUG=False
   USE_SQLITE_FALLBACK=False
   DB_HOST=[supabase-host]
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=[supabase-password]
   DB_NAME=postgres
   REDIS_URL=[upstash-redis-url]
   SECRET_KEY=sivora-super-secure-production-jwt-key-32chars
   GROQ_API_KEY=[optional-free-groq-key]
   GEMINI_API_KEY=[optional-free-gemini-key]
   AI_FALLBACK_ORDER=groq,gemini,mock
   ```
5. Click **Deploy Web Service** (Render provides free HTTPS URL e.g. `https://sivora-backend.onrender.com`).

---

## 4. Frontend Deployment: React (Vercel / Netlify)

1. Go to [vercel.com](https://vercel.com) and import your Git repository.
2. Select Root Directory: `22_ai_focus/frontend`.
3. Build Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   ```env
   VITE_API_URL=https://sivora-backend.onrender.com/api/v1
   ```
5. Click **Deploy**! Your frontend will be live on `https://sivora.vercel.app` with global CDN and automated SSL!

---

## 5. Local Production Testing with Docker Compose

You can verify the entire multi-container production stack locally with a single command:

```powershell
cd 22_ai_focus
docker compose up --build -d
```

- Storefront: `http://localhost:80`
- FastAPI Backend: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
