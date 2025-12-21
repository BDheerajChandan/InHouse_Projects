# ============================================
# FILE: app/core/database.py (UPDATED)
# ============================================
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Optional
from app.core.config import settings


class Database:
    def __init__(self):
        self.conn: Optional[psycopg2.extensions.connection] = None
        self.cursor: Optional[psycopg2.extras.RealDictCursor] = None
    
    def connect(self):
        """Establish database connection"""
        try:
            self.conn = psycopg2.connect(
                host=settings.DB_HOST,
                database=settings.DB_NAME,
                user=settings.DB_USER,
                password=settings.DB_PASSWORD,
                port=settings.DB_PORT,
                cursor_factory=RealDictCursor
            )
            self.cursor = self.conn.cursor()
            print("✅ Database connected successfully!")
            return self.conn
        except Exception as e:
            print(f"❌ Error connecting to database: {e}")
            raise
    
    def disconnect(self):
        """Close database connection"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()
        print("Database connection closed")
    
    def execute_query(self, query: str, params: tuple = None):
        """Execute a query and return results"""
        try:
            self.cursor.execute(query, params)
            self.conn.commit()
            return self.cursor
        except Exception as e:
            self.conn.rollback()
            print(f"Query execution error: {e}")
            raise
    
    def create_tables(self):
        """Create necessary tables - ONLY polls table, no votes table"""
        
        # Drop old votes table if exists
        drop_votes_table = "DROP TABLE IF EXISTS votes CASCADE;"
        
        # Create polls table with JSON data
        create_polls_table = """
        CREATE TABLE IF NOT EXISTS polls (
            id SERIAL PRIMARY KEY,
            poll_id VARCHAR(255) UNIQUE NOT NULL,
            creator_name VARCHAR(255) NOT NULL,
            poll_title VARCHAR(500) NOT NULL,
            questions JSONB NOT NULL,
            responses JSONB DEFAULT '[]'::jsonb,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        
        create_index = """
        CREATE INDEX IF NOT EXISTS idx_poll_id ON polls(poll_id);
        CREATE INDEX IF NOT EXISTS idx_responses ON polls USING GIN (responses);
        """
        
        try:
            self.execute_query(drop_votes_table)
            self.execute_query(create_polls_table)
            self.execute_query(create_index)
            print("✅ Tables created successfully!")
        except Exception as e:
            print(f"❌ Error creating tables: {e}")
            raise


# Global database instance
db = Database()


def get_db():
    """Dependency for getting database connection"""
    if not db.conn or db.conn.closed:
        db.connect()
    return db

