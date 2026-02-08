# app/routers/__init__.py

from app.routers.rooms import router as rooms_router
from app.routers.health import router as health_router
from app.routers.websocket import room_manager, handle_websocket

__all__ = [
    "rooms_router",
    "health_router",
    "room_manager",
    "handle_websocket",
]