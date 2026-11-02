import os
import sys
from pathlib import Path
from contextlib import asynccontextmanager

# Ensure backend directory is in sys.path so 'app' is resolvable from any working directory
backend_dir = str(Path(__file__).resolve().parent.parent)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.api.v1.router import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    # Initialize DB tables on startup
    await init_db()
    yield

app = FastAPI(
    title=f"{settings.PROJECT_NAME} — {settings.PROJECT_SUBTITLE}",
    description=(
        f"Production AI Personal Assistant API. Developed by {settings.DEVELOPER_NAME}.\n\n"
        f"GitHub: {settings.DEVELOPER_GITHUB}\n"
        f"LinkedIn: {settings.DEVELOPER_LINKEDIN}"
    ),
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS middleware: explicitly configured trusted origins with credentials support
# Filter out any accidental wildcard '*' to comply with browser CORS specifications
cors_origins = [str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS if origin and origin != "*"]
if not cors_origins and settings.ENVIRONMENT.lower() == "development":
    cors_origins = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Root"])
async def root():
    return {
        "product": settings.PROJECT_NAME,
        "subtitle": settings.PROJECT_SUBTITLE,
        "developer": settings.DEVELOPER_NAME,
        "github": settings.DEVELOPER_GITHUB,
        "linkedin": settings.DEVELOPER_LINKEDIN,
        "status": "online",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "developer": settings.DEVELOPER_NAME,
        "version": settings.VERSION
    }

