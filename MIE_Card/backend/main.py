# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.routers import routers
import os

app = FastAPI(title="MIE Card API", version="1.0.0")
origins=["http://localhost:4200",
         "http://localhost:8000",
         "http://127.0.0.1:8000",
         "*"
         ]
# CORS middleware to allow Angular frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Angular default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount static files for serving uploaded content
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(routers.router)

@app.get("/")
def root():
    return {
        "message": "MIE Card Backend API is running!",
        "docs": "/docs",
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy"}