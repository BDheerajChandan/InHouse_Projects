# ============================================
# FILE: setup_database.py (Database setup script)
# ============================================
"""
Script to set up the database
Run this once before starting the application
"""
import psycopg2
from app.core.config import settings

def create_database():
    """Create the database if it doesn't exist"""
    try:
        # Connect to default postgres database
        conn = psycopg2.connect(
            host=settings.DB_HOST,
            database='postgres',
            user=settings.DB_USER,
            password=settings.DB_PASSWORD,
            port=settings.DB_PORT
        )
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute(f"SELECT 1 FROM pg_database WHERE datname = '{settings.DB_NAME}'")
        exists = cursor.fetchone()
        
        if not exists:
            cursor.execute(f"CREATE DATABASE {settings.DB_NAME}")
            print(f"✅ Database '{settings.DB_NAME}' created successfully!")
        else:
            print(f"ℹ️  Database '{settings.DB_NAME}' already exists")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error creating database: {e}")
        raise

if __name__ == "__main__":
    print("Setting up database...")
    create_database()
    print("Database setup complete!")