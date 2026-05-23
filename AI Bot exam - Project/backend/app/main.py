from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import logging
import os

from app.core.config import settings
from app.database.connection import init_db
from app.routers import auth, interview, resume, analytics, voice, websocket_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI Interview Simulator Platform",
    description="Enterprise-grade AI Interview Platform with Sarvam AI Voice",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting AI Interview Platform...")
    await init_db()
    logger.info("Database initialized successfully")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down AI Interview Platform...")

# Mount static files for uploads
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(interview.router, prefix="/api/interview", tags=["Interview"])
app.include_router(resume.router, prefix="/api/resume", tags=["Resume"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(voice.router, prefix="/api/voice", tags=["Voice"])
app.include_router(websocket_router.router, prefix="/ws", tags=["WebSocket"])

@app.get("/")
async def root():
    return {"message": "AI Interview Simulator Platform API", "status": "running", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}