# ============================================
# FILE: run.py (Optional - for easy startup)
# ============================================
import uvicorn
from app.core.config import settings
import setup_database

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=True,
        log_level="info"
    )