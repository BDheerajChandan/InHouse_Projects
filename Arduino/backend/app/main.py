# main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import led

app = FastAPI()

# ✅ CORS (important for React frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8000/","http://localhost:5173/","*"],   # ⚠️ for dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "Arduino LED API Running"}


# ✅ Include Router
app.include_router(led.router)