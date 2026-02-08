# app/routers/rooms.py
# app/routers/rooms.py

from fastapi import APIRouter, HTTPException, Depends
from typing import List
import uuid

from app.schemas.room import RoomCreate, RoomResponse, RoomInfo
from app.crud.room import room_crud, drawing_crud
from app.core.config import settings
from app.routers.websocket import room_manager

router = APIRouter(prefix="/api/rooms", tags=["rooms"])


@router.post("/create", response_model=RoomResponse)
async def create_room(room_data: RoomCreate = None):
    """
    Create a new drawing room
    
    Returns:
        RoomResponse with room_id, max_users, creator_name, and shareable_url
    """
    # Generate unique room ID
    room_id = str(uuid.uuid4())
    
    # Get max_users and creator_name from request or use default
    max_users = room_data.max_users if room_data and room_data.max_users else settings.MAX_USERS_PER_ROOM
    creator_name = room_data.creator_name if room_data and room_data.creator_name else "Anonymous"
    
    # Create room in memory with creator name
    room_manager.create_room(room_id, max_users, creator_name)
    
    # Save to database with creator name
    await room_crud.create_room(room_id, max_users, creator_name)
    
    return RoomResponse(
        room_id=room_id,
        max_users=max_users,
        creator_name=creator_name,
        shareable_url=f"/draw/{room_id}"
    )


@router.get("/{room_id}", response_model=RoomInfo)
async def get_room_info(room_id: str):
    """
    Get information about a specific room
    
    Args:
        room_id: The unique identifier of the room
        
    Returns:
        RoomInfo with current status including creator name
    """
    # Check in memory first
    if room_manager.room_exists(room_id):
        room = room_manager.get_room(room_id)
        return RoomInfo(
            room_id=room.room_id,
            active_users=len(room.connections),
            max_users=room.max_users,
            creator_name=room.creator_name,
            is_full=room.is_full(),
            exists=True
        )
    
    # Check in database
    exists = await room_crud.room_exists(room_id)
    if exists:
        room_data = await room_crud.get_room(room_id)
        return RoomInfo(
            room_id=room_id,
            active_users=0,
            max_users=room_data.get('max_users', settings.MAX_USERS_PER_ROOM) if room_data else settings.MAX_USERS_PER_ROOM,
            creator_name=room_data.get('creator_name', 'Anonymous') if room_data else 'Anonymous',
            is_full=False,
            exists=True
        )
    
    raise HTTPException(status_code=404, detail="Room not found")


@router.get("/", response_model=List[dict])
async def get_all_rooms():
    """
    Get all rooms (for admin/debugging purposes)
    
    Returns:
        List of all rooms with their information
    """
    rooms = await room_crud.get_all_rooms()
    
    # Add active user counts from memory
    for room_data in rooms:
        room_id = room_data['room_id']
        if room_manager.room_exists(room_id):
            room = room_manager.get_room(room_id)
            room_data['active_users'] = len(room.connections)
            room_data['is_active'] = True
        else:
            room_data['active_users'] = 0
            room_data['is_active'] = False
    
    return rooms


@router.delete("/{room_id}")
async def delete_room(room_id: str):
    """
    Delete a room and all its drawing data
    
    Args:
        room_id: The unique identifier of the room
        
    Returns:
        Success message
    """
    # Check if room exists
    exists = await room_crud.room_exists(room_id)
    if not exists and not room_manager.room_exists(room_id):
        raise HTTPException(status_code=404, detail="Room not found")
    
    # Remove from memory if exists
    if room_manager.room_exists(room_id):
        room = room_manager.get_room(room_id)
        # Close all connections
        for conn in room.connections[:]:
            try:
                await conn.websocket.close()
            except:
                pass
        # Remove room
        del room_manager.rooms[room_id]
    
    # Delete from database
    await room_crud.delete_room(room_id)
    
    return {"message": f"Room {room_id} deleted successfully"}


@router.get("/{room_id}/stats")
async def get_room_stats(room_id: str):
    """
    Get statistics for a room
    
    Args:
        room_id: The unique identifier of the room
        
    Returns:
        Room statistics including drawing count and user activities
    """
    # Check if room exists
    exists = await room_crud.room_exists(room_id)
    if not exists and not room_manager.room_exists(room_id):
        raise HTTPException(status_code=404, detail="Room not found")
    
    drawing_count = await drawing_crud.get_drawing_count(room_id)
    user_activities = await room_crud.get_user_activities(room_id)
    
    active_users = 0
    if room_manager.room_exists(room_id):
        room = room_manager.get_room(room_id)
        active_users = len(room.connections)
    
    room_data = await room_crud.get_room(room_id)
    
    return {
        "room_id": room_id,
        "creator_name": room_data.get('creator_name', 'Anonymous') if room_data else 'Anonymous',
        "active_users": active_users,
        "max_users": room_data.get('max_users', settings.MAX_USERS_PER_ROOM) if room_data else settings.MAX_USERS_PER_ROOM,
        "drawing_count": drawing_count,
        "user_activities": user_activities,
        "created_at": str(room_data.get('created_at')) if room_data else None,
        "updated_at": str(room_data.get('updated_at')) if room_data else None
    }