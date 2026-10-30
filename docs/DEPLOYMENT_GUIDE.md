# HAIDER AI — Production Deployment Guide

**Developer:** Syed Haider Ali  
**GitHub:** [syedhaiderali-0164](https://github.com/syedhaiderali-0164)  
**LinkedIn:** [Syed Haider Ali](https://www.linkedin.com/in/haider-ali-1447bb3a/)  

---

## 1. Cloud Architecture Strategy

| Layer | Recommended Cloud Provider | Alternative Options |
|---|---|---|
| **Frontend** | Vercel or Netlify | AWS Amplify, Cloudflare Pages |
| **Backend** | Render or Railway | Fly.io, AWS App Runner, DigitalOcean |
| **Database** | Managed PostgreSQL (Neon or Supabase) | AWS RDS, Render Postgres |
| **File Storage** | Local Volume / AWS S3 | Cloudinary |

---

## 2. Frontend Deployment (Vercel / Netlify)

1. Connect your GitHub repository `haider-ai-personal-assistant` to Vercel or Netlify.
2. Configure build settings:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: Your deployed backend URL (e.g. `https://haider-ai-api.onrender.com`)
4. In `vercel.json` or `_redirects` (Netlify), configure SPA rewrite:
   ```json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```

---

## 3. Backend Deployment (Render / Railway)

1. Create a new Web Service pointing to the `backend/` directory or root Dockerfile.
2. Set Environment Variables:
   ```env
   PYTHONPATH=.
   DATABASE_URL=postgresql+asyncpg://<user>:<password>@<host>:5432/<db_name>
   SYNC_DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<db_name>
   SECRET_KEY=<your_generated_production_jwt_secret>
   BACKEND_CORS_ORIGINS=["https://your-frontend.vercel.app"]
   DEFAULT_AI_PROVIDER=openai
   DEFAULT_AI_BASE_URL=https://api.openai.com/v1
   DEFAULT_AI_MODEL=gpt-4o-mini
   DEFAULT_AI_API_KEY=<optional_fallback_key>
   ```
3. **Build Command:** `pip install -r backend/requirements.txt`
4. **Start Command:** `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`

---

## 4. Database Migrations in Production

Run Alembic migrations against your production database:
```bash
alembic upgrade head
```

---

## 5. Docker Deployment

Deploy in one command using Docker Compose:
```bash
docker-compose up --build -d
```
The application will be live at `http://localhost` (Frontend on port 80, Backend on port 8000, PostgreSQL on port 5432).
