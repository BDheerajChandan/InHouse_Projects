# app/core/database.py
# app/core/database.py

import asyncpg
from typing import Optional
from app.core.config import settings


class Database:
    """Database connection manager"""
    
    def __init__(self):
        self.pool: Optional[asyncpg.Pool] = None
    
    async def connect(self):
        """Initialize database connection pool"""
        try:
            self.pool = await asyncpg.create_pool(
                host=settings.DB_HOST,
                port=settings.DB_PORT,
                user=settings.DB_USER,
                password=settings.DB_PASSWORD,
                database=settings.DB_NAME,
                min_size=5,
                max_size=20,
                command_timeout=60
            )
            print(f"✓ Database connected: {settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}")
            await self.create_tables()
        except Exception as e:
            print(f"✗ Database connection failed: {e}")
            print("  Application will run without database persistence")
            self.pool = None
    
    async def disconnect(self):
        """Close database connection pool"""
        if self.pool:
            await self.pool.close()
            print("✓ Database disconnected")
    
    async def create_tables(self):
        """Create database tables if they don't exist"""
        if not self.pool:
            return
        
        try:
            async with self.pool.acquire() as conn:
                # Create rooms table with creator_name
                await conn.execute('''
                    CREATE TABLE IF NOT EXISTS rooms (
                        id SERIAL PRIMARY KEY,
                        room_id VARCHAR(255) UNIQUE NOT NULL,
                        max_users INTEGER DEFAULT 5,
                        creator_name VARCHAR(255) DEFAULT 'Anonymous',
                        created_at TIMESTAMP DEFAULT NOW(),
                        updated_at TIMESTAMP DEFAULT NOW()
                    )
                ''')
                
                # Add creator_name column if it doesn't exist (for existing databases)
                try:
                    await conn.execute('''
                        ALTER TABLE rooms ADD COLUMN IF NOT EXISTS creator_name VARCHAR(255) DEFAULT 'Anonymous'
                    ''')
                except:
                    pass
                
                # Create drawing_data table with user_name
                await conn.execute('''
                    CREATE TABLE IF NOT EXISTS drawing_data (
                        id SERIAL PRIMARY KEY,
                        room_id VARCHAR(255) NOT NULL,
                        draw_data JSONB NOT NULL,
                        user_name VARCHAR(255) DEFAULT 'Anonymous',
                        created_at TIMESTAMP DEFAULT NOW(),
                        FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
                    )
                ''')
                
                # Add user_name column if it doesn't exist (for existing databases)
                try:
                    await conn.execute('''
                        ALTER TABLE drawing_data ADD COLUMN IF NOT EXISTS user_name VARCHAR(255) DEFAULT 'Anonymous'
                    ''')
                except:
                    pass
                
                # Create user_activities table
                await conn.execute('''
                    CREATE TABLE IF NOT EXISTS user_activities (
                        id SERIAL PRIMARY KEY,
                        room_id VARCHAR(255) NOT NULL,
                        user_name VARCHAR(255) NOT NULL,
                        activity VARCHAR(50) NOT NULL,
                        created_at TIMESTAMP DEFAULT NOW(),
                        FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE CASCADE
                    )
                ''')
                
                # Create indexes
                await conn.execute('''
                    CREATE INDEX IF NOT EXISTS idx_drawing_data_room_id 
                    ON drawing_data(room_id)
                ''')
                
                await conn.execute('''
                    CREATE INDEX IF NOT EXISTS idx_drawing_data_user_name 
                    ON drawing_data(user_name)
                ''')
                
                await conn.execute('''
                    CREATE INDEX IF NOT EXISTS idx_rooms_room_id 
                    ON rooms(room_id)
                ''')
                
                await conn.execute('''
                    CREATE INDEX IF NOT EXISTS idx_user_activities_room_id 
                    ON user_activities(room_id)
                ''')
                
                # Create updated_at trigger function
                await conn.execute('''
                    CREATE OR REPLACE FUNCTION update_updated_at_column()
                    RETURNS TRIGGER AS $$
                    BEGIN
                        NEW.updated_at = NOW();
                        RETURN NEW;
                    END;
                    $$ language 'plpgsql'
                ''')
                
                # Create trigger for rooms table
                await conn.execute('''
                    DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms
                ''')
                
                await conn.execute('''
                    CREATE TRIGGER update_rooms_updated_at 
                        BEFORE UPDATE ON rooms 
                        FOR EACH ROW 
                        EXECUTE FUNCTION update_updated_at_column()
                ''')
                
                print("✓ Database tables initialized")
        except Exception as e:
            print(f"✗ Error creating tables: {e}")
    
    def is_connected(self) -> bool:
        """Check if database is connected"""
        return self.pool is not None
    
    async def get_connection(self):
        """Get a connection from the pool"""
        if not self.pool:
            raise Exception("Database not connected")
        return self.pool.acquire()


# Create database instance
database = Database()


async def get_database() -> Database:
    """Dependency to get database instance"""
    return database