"""
Run script for Shadow of the Endless Forest API
Starts the FastAPI server using uvicorn
"""

import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    # Get configuration from environment variables
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    
    print("=" * 60)
    print("🌲 Shadow of the Endless Forest - Backend Server 🌲")
    print("=" * 60)
    print(f"Starting server on http://{host}:{port}")
    print(f"API Documentation: http://localhost:{port}/docs")
    print("=" * 60)
    
    # Run the server
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=True,  # Enable auto-reload during development
        log_level="info"
    )