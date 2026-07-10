"""
JobShield AI — FastAPI Backend
main.py — Application entry point, CORS config, router registration
Place at: backend/app/main.py
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.routes import router
from app.firebase_admin import initialize_firebase


# ─── Lifespan: runs once on startup and shutdown ─────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize Firebase Admin SDK on startup."""
    initialize_firebase()
    print("✅  Firebase Admin SDK initialized")
    yield
    print("🛑  JobShield backend shutting down")


# ─── App Factory ─────────────────────────────────────────────────────────────
app = FastAPI(
    title="JobShield AI API",
    description="AI-powered employment fraud detection backend",
    version="1.0.0",
    docs_url="/docs",          # Swagger UI at /docs
    redoc_url="/redoc",        # ReDoc at /redoc
    lifespan=lifespan,
)

# ─── CORS — allow React dev server + production frontend ─────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://localhost:3000",
    "https://jobshield-ai.vercel.app",
    "https://job-shield-ai-phi.vercel.app",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Register all route modules ───────────────────────────────────────────────
app.include_router(router, prefix="/api")


# ─── Root health-check ───────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    return {
        "service": "JobShield AI Backend",
        "status": "running",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
async def health():
    return {"status": "ok"}
