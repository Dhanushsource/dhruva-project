"""Career Compass AI — FastAPI application factory."""
from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from .config import settings
from .database import Base, engine, get_db
from .routers import auth, careers, profile, recommendations, saved_careers
from .seed import seed_careers

# DB bootstrap (create tables if missing)
Base.metadata.create_all(bind=engine)


@asynccontextmanager
async def lifespan(fastapi_app: FastAPI):
    database = next(get_db())
    try:
        seed_careers(database)
    finally:
        database.close()
    yield


# ---------------------------------------------------------------------------
# App & middleware
# ---------------------------------------------------------------------------

limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])

app = FastAPI(
    title="Career Compass AI API",
    version="2.0.0",
    description="Profile-based career guidance for Indian students.",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_error_handler(request: Request, exc: Exception):
    from fastapi import HTTPException
    if isinstance(exc, HTTPException):
        raise exc
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again."},
    )


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/health", tags=["meta"])
def health() -> dict[str, str]:
    return {"status": "ok", "service": "career-compass-api", "version": "2.0.0"}


# ---------------------------------------------------------------------------
# Mount routers
# ---------------------------------------------------------------------------

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(careers.router)
app.include_router(saved_careers.router)
app.include_router(recommendations.router)

# ---------------------------------------------------------------------------
# Serve frontend (must be last — catches all unmatched paths)
# ---------------------------------------------------------------------------

project_root = Path(__file__).resolve().parents[2]
app.mount("/", StaticFiles(directory=str(project_root), html=True), name="frontend")
