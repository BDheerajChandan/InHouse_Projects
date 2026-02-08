"""
Main FastAPI application for Shadow of the Endless Forest game
Handles game state management and API endpoints
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import game_router
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Shadow of the Endless Forest API",
    description="Backend API for the endless survival action game",
    version="1.0.0"
)

# Configure CORS
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(game_router.router, prefix="/api/game", tags=["game"])

# Health check endpoint
@app.get("/")
async def root():
    """Root endpoint - health check"""
    return {
        "status": "online",
        "message": "Shadow of the Endless Forest API is running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}