from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.database import init_db
from backend.app.api.v1.router import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
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

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
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
