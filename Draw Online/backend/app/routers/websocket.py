# app/routers/websocket.py
# app/routers/websocket.py
# app/routers/websocket.py

from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List
from app.core.config import settings
from app.crud.room import room_crud, drawing_crud
import json


class UserConnection:
    """Represents a user connection"""
    def __init__(self, websocket: WebSocket, user_id: str, name: str = "Anonymous"):
        self.websocket = websocket
        self.user_id = user_id
        self.name = name
        self.color = "#000000"


class Room:
    """Represents a drawing room"""
    
    def __init__(self, room_id: str, max_users: int = None, creator_name: str = None):
        self.room_id = room_id
        self.max_users = max_users or settings.MAX_USERS_PER_ROOM
        self.creator_name = creator_name
        self.connections: List[UserConnection] = []
        self.drawing_data: List[dict] = []
        self.available_colors = [
            "#FF0000",  # Red
            "#00FF00",  # Green
            "#0000FF",  # Blue
            "#FFFF00",  # Yellow
            "#FF00FF",  # Magenta
            "#00FFFF",  # Cyan
            "#FFA500",  # Orange
            "#800080",  # Purple
            "#FF1493",  # Deep Pink
            "#32CD32",  # Lime Green
        ]
        self.color_index = 0
    
    def get_next_color(self) -> str:
        """Get next available color for user"""
        color = self.available_colors[self.color_index % len(self.available_colors)]
        self.color_index += 1
        return color
    
    def add_connection(self, websocket: WebSocket, name: str = "Anonymous") -> UserConnection:
        """Add a new connection to the room"""
        if len(self.connections) >= self.max_users:
            raise ValueError("Room is full")
        
        user_id = str(id(websocket))
        color = self.get_next_color()
        
        user_conn = UserConnection(websocket, user_id, name)
        user_conn.color = color
        
        self.connections.append(user_conn)
        return user_conn
    
    def remove_connection(self, websocket: WebSocket):
        """Remove a connection from the room"""
        self.connections = [conn for conn in self.connections if conn.websocket != websocket]
    
    def get_connection(self, websocket: WebSocket) -> UserConnection:
        """Get user connection by websocket"""
        for conn in self.connections:
            if conn.websocket == websocket:
                return conn
        return None
    
    def update_user_name(self, websocket: WebSocket, name: str):
        """Update user name"""
        conn = self.get_connection(websocket)
        if conn:
            conn.name = name
    
    def is_full(self) -> bool:
        """Check if room is at max capacity"""
        return len(self.connections) >= self.max_users
    
    def get_user_count(self) -> int:
        """Get current number of users"""
        return len(self.connections)
    
    def get_users_info(self) -> List[dict]:
        """Get information about all users"""
        return [
            {
                "id": conn.user_id,
                "name": conn.name,
                "color": conn.color
            }
            for conn in self.connections
        ]


class RoomManager:
    """Manages all active rooms"""
    
    def __init__(self):
        self.rooms: Dict[str, Room] = {}
    
    def create_room(self, room_id: str = None, max_users: int = None, creator_name: str = None) -> str:
        """Create a new room"""
        if room_id and room_id in self.rooms:
            return room_id
        
        if not room_id:
            import uuid
            room_id = str(uuid.uuid4())
        
        self.rooms[room_id] = Room(room_id, max_users, creator_name)
        return room_id
    
    def get_room(self, room_id: str) -> Room:
        """Get a room by ID"""
        if room_id not in self.rooms:
            raise ValueError(f"Room {room_id} not found")
        return self.rooms[room_id]
    
    def room_exists(self, room_id: str) -> bool:
        """Check if room exists in memory"""
        return room_id in self.rooms
    
    def delete_room(self, room_id: str):
        """Delete a room"""
        if room_id in self.rooms:
            del self.rooms[room_id]
    
    async def broadcast(self, room_id: str, message: dict, exclude: WebSocket = None):
        """Broadcast message to all users in room except excluded one"""
        if room_id not in self.rooms:
            return
        
        room = self.rooms[room_id]
        disconnected = []
        
        for connection in room.connections:
            if connection.websocket != exclude:
                try:
                    await connection.websocket.send_json(message)
                except Exception as e:
                    print(f"Error broadcasting to connection: {e}")
                    disconnected.append(connection.websocket)
        
        # Clean up disconnected connections
        for conn_ws in disconnected:
            room.remove_connection(conn_ws)


# Create global room manager instance
room_manager = RoomManager()


async def handle_websocket(websocket: WebSocket, room_id: str):
    """Handle WebSocket connection for a room"""
    
    # Check if room exists in memory or database
    room_exists_in_memory = room_manager.room_exists(room_id)
    room_exists_in_db = await room_crud.room_exists(room_id)
    
    if not room_exists_in_memory and not room_exists_in_db:
        await websocket.close(code=4004, reason="Room not found")
        return
    
    # Create room in memory if it doesn't exist
    if not room_exists_in_memory:
        room_data = await room_crud.get_room(room_id)
        max_users = room_data.get('max_users', settings.MAX_USERS_PER_ROOM) if room_data else settings.MAX_USERS_PER_ROOM
        creator_name = room_data.get('creator_name', None) if room_data else None
        room_manager.create_room(room_id, max_users, creator_name)
        
        # Load drawing data from database
        drawing_data = await drawing_crud.get_drawings(room_id)
        room_manager.rooms[room_id].drawing_data = drawing_data
    
    user_conn = None
    
    try:
        room = room_manager.get_room(room_id)
        
        # Check if room is full
        if room.is_full():
            await websocket.close(code=4003, reason="Room is full")
            return
        
        # Accept connection
        await websocket.accept()
        
        # Send room info including creator name
        await websocket.send_json({
            "type": "room_info",
            "creatorName": room.creator_name,
            "maxUsers": room.max_users
        })
        
        # Handle incoming messages
        while True:
            data = await websocket.receive_json()
            
            if data["type"] == "join":
                # User is joining with their name
                user_name = data.get("userName", "Anonymous")
                
                # Add user to room
                user_conn = room.add_connection(websocket, user_name)
                
                # Send connection confirmation
                await websocket.send_json({
                    "type": "connected",
                    "color": user_conn.color,
                    "activeUsers": room.get_user_count(),
                    "maxUsers": room.max_users,
                    "users": room.get_users_info()
                })
                
                # Send existing drawing data
                if room.drawing_data:
                    await websocket.send_json({
                        "type": "init",
                        "data": room.drawing_data
                    })
                
                # Notify others of new user
                await room_manager.broadcast(
                    room_id,
                    {
                        "type": "user_joined",
                        "activeUsers": room.get_user_count(),
                        "maxUsers": room.max_users,
                        "users": room.get_users_info()
                    },
                    exclude=websocket
                )
                
                # Log user join to database
                await room_crud.log_user_activity(room_id, user_name, "joined")
            
            elif data["type"] == "draw":
                if not user_conn:
                    continue
                
                # Add user info to drawing data
                data["userName"] = user_conn.name
                data["color"] = data.get("color", user_conn.color)
                
                # Store drawing data
                room.drawing_data.append(data)
                
                # Save to database with user name
                await drawing_crud.save_drawing(room_id, data)
                
                # Broadcast to other users
                await room_manager.broadcast(room_id, data, exclude=websocket)
            
            elif data["type"] == "clear":
                if not user_conn:
                    continue
                
                # Clear drawing data
                room.drawing_data = []
                
                # Clear in database
                await drawing_crud.clear_drawings(room_id)
                
                # Log clear action
                await room_crud.log_user_activity(room_id, user_conn.name, "cleared_canvas")
                
                # Broadcast clear to other users
                await room_manager.broadcast(
                    room_id,
                    {"type": "clear"},
                    exclude=websocket
                )
    
    except WebSocketDisconnect:
        print(f"WebSocket disconnected from room {room_id}")
    except Exception as e:
        print(f"WebSocket error in room {room_id}: {e}")
    finally:
        # Remove user from room
        try:
            if user_conn:
                # Log user leave
                await room_crud.log_user_activity(room_id, user_conn.name, "left")
                
                room.remove_connection(websocket)
                
                # Notify others of user leaving
                await room_manager.broadcast(
                    room_id,
                    {
                        "type": "user_left",
                        "activeUsers": room.get_user_count(),
                        "maxUsers": room.max_users,
                        "users": room.get_users_info()
                    }
                )
                
                # Clean up empty rooms
                if room.get_user_count() == 0:
                    print(f"Room {room_id} is now empty")
        
        except Exception as e:
            print(f"Error cleaning up connection: {e}")