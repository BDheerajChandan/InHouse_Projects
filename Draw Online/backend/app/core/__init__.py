# app/core/__init__.py

from app.core.config import settings, get_settings
from app.core.database import database, get_database

__all__ = [
    "settings",
    "get_settings",
    "database",
    "get_database",
]