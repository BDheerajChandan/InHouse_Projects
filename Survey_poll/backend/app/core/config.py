# ============================================
# FILE: app/core/config.py
# ============================================
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DB_HOST: str
    DB_NAME: str
    DB_PORT: int
    DB_USER: str
    DB_PASSWORD: str
    
    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
