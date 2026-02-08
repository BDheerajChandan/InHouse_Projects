# app/routers/health.py

from fastapi import APIRouter
from app.core.config import settings
from app.core.database import database
from app.routers.websocket import room_manager

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    """
    Health check endpoint
    
    Returns system status and database connectivity
    """
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "database": "connected" if database.is_connected() else "disconnected",
        "active_rooms": len(room_manager.rooms)
    }


@router.get("/")
async def root():
    """
    Root endpoint with API information
    """
    return {
        "message": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "database": "connected" if database.is_connected() else "disconnected",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "create_room": "/api/rooms/create",
            "websocket": "/ws/{room_id}"
        }
    }