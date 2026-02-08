# app/main.py

from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import database
from app.routers import rooms_router, health_router, handle_websocket

# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Real-time collaborative drawing application with persistent storage"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Startup event
@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    print("=" * 60)
    print(f"🎨 {settings.APP_NAME} v{settings.APP_VERSION}")
    print("=" * 60)
    
    # Connect to database
    await database.connect()
    
    print("=" * 60)
    print("✓ Application started successfully")
    print(f"📊 Max users per room: {settings.MAX_USERS_PER_ROOM}")
    print("=" * 60)


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on application shutdown"""
    print("=" * 60)
    print("🛑 Shutting down application...")
    
    # Disconnect from database
    await database.disconnect()
    
    print("✓ Application stopped")
    print("=" * 60)


# Include routers
app.include_router(health_router)
app.include_router(rooms_router)


# WebSocket endpoint
@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    """
    WebSocket endpoint for real-time drawing collaboration
    
    Args:
        websocket: WebSocket connection
        room_id: Unique identifier for the room
    """
    await handle_websocket(websocket, room_id)