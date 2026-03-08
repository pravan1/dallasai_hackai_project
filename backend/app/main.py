"""
LearnFlow FastAPI backend.

Run with:
  cd backend
  uvicorn app.main:app --reload --port 8000

Or from the repo root:
  npm run dev   (starts both frontend and backend)
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .routers import chat, profile, recommendations, sources, studio

app = FastAPI(
    title="LearnFlow API",
    version="0.1.0",
    docs_url="/docs",   # Swagger UI at http://localhost:8000/docs
    redoc_url="/redoc",
)

# Allow the Next.js dev server (and any configured frontend URL) to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------- routers

app.include_router(chat.router)
app.include_router(sources.router)
app.include_router(profile.router)
app.include_router(recommendations.router)
app.include_router(studio.router)


# ----------------------------------------------------------------- health check

@app.get("/health")
def health():
    return {
        "status": "ok",
        "gemini_configured": bool(settings.google_ai_api_key),
        "auth0_configured": bool(settings.auth0_domain and settings.auth0_audience),
    }
