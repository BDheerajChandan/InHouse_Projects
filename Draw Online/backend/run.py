# run.py
import uvicorn
import os
import socket
from dotenv import load_dotenv

load_dotenv()


def get_local_ip():
    """Get the local IP address"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "localhost"


if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    local_ip = get_local_ip()

    print("=" * 60)
    print("🎨 Draw Online - Backend Server")
    print("=" * 60)
    print(f"🚀 Server starting on {host}:{port}")
    print(f"📡 Local access: http://localhost:{port}")
    print(f"🌐 Network access: http://{local_ip}:{port}")
    print(f"📊 Status: http://{local_ip}:{port}/health")
    print("=" * 60)
    print("💡 Update frontend/.env with:")
    print(f"   BACKEND_HOST={local_ip}")
    print(f"   BACKEND_PORT={port}")
    print("=" * 60)

    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )