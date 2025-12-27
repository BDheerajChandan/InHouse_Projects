# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import audio  # <-- Import the router

from dotenv import load_dotenv
load_dotenv()

app = FastAPI()

# Allow React frontend to call
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://localhost:8000","http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes from routers/audio.py
app.include_router(audio.router)

@app.get("/")
def root():
    return {"message": "Hi, welcome to Audio Recorder application"}
