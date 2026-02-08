# app/schemas/room.py
# app/schemas/room.py

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class RoomCreate(BaseModel):
    """Schema for creating a room"""
    max_users: Optional[int] = Field(default=5, ge=1, le=50)
    creator_name: Optional[str] = Field(default="Anonymous", max_length=255)


class RoomResponse(BaseModel):
    """Schema for room response"""
    room_id: str
    max_users: int
    creator_name: str
    shareable_url: str
    
    class Config:
        from_attributes = True


class RoomInfo(BaseModel):
    """Schema for room information"""
    room_id: str
    active_users: int
    max_users: int
    creator_name: Optional[str] = "Anonymous"
    is_full: bool
    exists: bool
    
    class Config:
        from_attributes = True


class DrawData(BaseModel):
    """Schema for drawing data"""
    type: str
    prevX: Optional[float] = None
    prevY: Optional[float] = None
    x: Optional[float] = None
    y: Optional[float] = None
    color: Optional[str] = None
    lineWidth: Optional[int] = None
    userName: Optional[str] = "Anonymous"
    
    class Config:
        from_attributes = True


class WebSocketMessage(BaseModel):
    """Schema for WebSocket messages"""
    type: str
    color: Optional[str] = None
    activeUsers: Optional[int] = None
    maxUsers: Optional[int] = None
    data: Optional[List[Dict[str, Any]]] = None
    userName: Optional[str] = None
    creatorName: Optional[str] = None
    
    class Config:
        from_attributes = True