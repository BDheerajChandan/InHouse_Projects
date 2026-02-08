# app/crud/room.py
# app/crud/room.py

import json
from typing import List, Dict, Optional
from app.core.database import database


class RoomCRUD:
    """CRUD operations for rooms"""
    
    @staticmethod
    async def create_room(room_id: str, max_users: int, creator_name: str = "Anonymous") -> bool:
        """Create a new room in database with creator name"""
        if not database.pool:
            return False
        
        try:
            async with database.pool.acquire() as conn:
                await conn.execute('''
                    INSERT INTO rooms (room_id, max_users, creator_name)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (room_id) DO NOTHING
                ''', room_id, max_users, creator_name)
                return True
        except Exception as e:
            print(f"Error creating room in DB: {e}")
            return False
    
    @staticmethod
    async def get_room(room_id: str) -> Optional[Dict]:
        """Get room from database"""
        if not database.pool:
            return None
        
        try:
            async with database.pool.acquire() as conn:
                row = await conn.fetchrow('''
                    SELECT * FROM rooms WHERE room_id = $1
                ''', room_id)
                
                if row:
                    return dict(row)
                return None
        except Exception as e:
            print(f"Error getting room from DB: {e}")
            return None
    
    @staticmethod
    async def room_exists(room_id: str) -> bool:
        """Check if room exists in database"""
        if not database.pool:
            return False
        
        try:
            async with database.pool.acquire() as conn:
                result = await conn.fetchval('''
                    SELECT EXISTS(SELECT 1 FROM rooms WHERE room_id = $1)
                ''', room_id)
                return result
        except Exception as e:
            print(f"Error checking room existence: {e}")
            return False
    
    @staticmethod
    async def delete_room(room_id: str) -> bool:
        """Delete room from database"""
        if not database.pool:
            return False
        
        try:
            async with database.pool.acquire() as conn:
                await conn.execute('''
                    DELETE FROM rooms WHERE room_id = $1
                ''', room_id)
                return True
        except Exception as e:
            print(f"Error deleting room: {e}")
            return False
    
    @staticmethod
    async def get_all_rooms() -> List[Dict]:
        """Get all rooms from database"""
        if not database.pool:
            return []
        
        try:
            async with database.pool.acquire() as conn:
                rows = await conn.fetch('''
                    SELECT * FROM rooms ORDER BY created_at DESC
                ''')
                return [dict(row) for row in rows]
        except Exception as e:
            print(f"Error getting all rooms: {e}")
            return []
    
    @staticmethod
    async def log_user_activity(room_id: str, user_name: str, activity: str) -> bool:
        """Log user activity in database"""
        if not database.pool:
            return False
        
        try:
            async with database.pool.acquire() as conn:
                await conn.execute('''
                    INSERT INTO user_activities (room_id, user_name, activity)
                    VALUES ($1, $2, $3)
                ''', room_id, user_name, activity)
                return True
        except Exception as e:
            print(f"Error logging user activity: {e}")
            return False
    
    @staticmethod
    async def get_user_activities(room_id: str, limit: int = 50) -> List[Dict]:
        """Get user activities for a room"""
        if not database.pool:
            return []
        
        try:
            async with database.pool.acquire() as conn:
                rows = await conn.fetch('''
                    SELECT user_name, activity, created_at 
                    FROM user_activities 
                    WHERE room_id = $1 
                    ORDER BY created_at DESC 
                    LIMIT $2
                ''', room_id, limit)
                return [
                    {
                        "user_name": row['user_name'],
                        "activity": row['activity'],
                        "created_at": str(row['created_at'])
                    }
                    for row in rows
                ]
        except Exception as e:
            print(f"Error getting user activities: {e}")
            return []


class DrawingCRUD:
    """CRUD operations for drawings"""
    
    @staticmethod
    async def save_drawing(room_id: str, draw_data: Dict) -> bool:
        """Save drawing data to database with user name"""
        if not database.pool:
            return False
        
        try:
            async with database.pool.acquire() as conn:
                await conn.execute('''
                    INSERT INTO drawing_data (room_id, draw_data, user_name)
                    VALUES ($1, $2, $3)
                ''', room_id, json.dumps(draw_data), draw_data.get('userName', 'Anonymous'))
                return True
        except Exception as e:
            print(f"Error saving drawing to DB: {e}")
            return False
    
    @staticmethod
    async def get_drawings(room_id: str) -> List[Dict]:
        """Get all drawings for a room"""
        if not database.pool:
            return []
        
        try:
            async with database.pool.acquire() as conn:
                rows = await conn.fetch('''
                    SELECT draw_data FROM drawing_data
                    WHERE room_id = $1
                    ORDER BY created_at ASC
                ''', room_id)
                return [json.loads(row['draw_data']) for row in rows]
        except Exception as e:
            print(f"Error loading drawings from DB: {e}")
            return []
    
    @staticmethod
    async def clear_drawings(room_id: str) -> bool:
        """Clear all drawings for a room"""
        if not database.pool:
            return False
        
        try:
            async with database.pool.acquire() as conn:
                await conn.execute('''
                    DELETE FROM drawing_data WHERE room_id = $1
                ''', room_id)
                return True
        except Exception as e:
            print(f"Error clearing drawings: {e}")
            return False
    
    @staticmethod
    async def get_drawing_count(room_id: str) -> int:
        """Get count of drawings for a room"""
        if not database.pool:
            return 0
        
        try:
            async with database.pool.acquire() as conn:
                count = await conn.fetchval('''
                    SELECT COUNT(*) FROM drawing_data WHERE room_id = $1
                ''', room_id)
                return count or 0
        except Exception as e:
            print(f"Error getting drawing count: {e}")
            return 0
    
    @staticmethod
    async def get_drawings_by_user(room_id: str, user_name: str) -> List[Dict]:
        """Get drawings by specific user"""
        if not database.pool:
            return []
        
        try:
            async with database.pool.acquire() as conn:
                rows = await conn.fetch('''
                    SELECT draw_data, created_at FROM drawing_data
                    WHERE room_id = $1 AND user_name = $2
                    ORDER BY created_at ASC
                ''', room_id, user_name)
                return [
                    {
                        "data": json.loads(row['draw_data']),
                        "created_at": str(row['created_at'])
                    }
                    for row in rows
                ]
        except Exception as e:
            print(f"Error getting user drawings: {e}")
            return []


# Create instances
room_crud = RoomCRUD()
drawing_crud = DrawingCRUD()