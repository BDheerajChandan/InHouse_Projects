# backend\app\main.py
"""
main.py — FastAPI application factory.

Startup sequence:
  1. Load .env → Settings
  2. CORSMiddleware (origins from ALLOWED_ORIGINS in .env)
  3. startup event → init_db()
     - CREATE DATABASE Booking  (if not exists)
     - CREATE TABLE train, bus, flight, car, bike  (if not exist)
     - CREATE TABLE Travel_history  (if not exists)
  4. Mount /api router
  5. Expose /health endpoint
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.database.db import init_db
from app.routers import chat

app = FastAPI(
    title       = "AI Travel Booking Agent API",
    description = (
        "LLM-powered (OpenAI / Gemini) travel booking agent. "
        "Natural language → PostgreSQL CRUD. "
        "Supports booking, history, update-by-route, update-by-id, cancel."
    ),
    version  = "3.0.0",
    docs_url = "/docs",
    redoc_url= "/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins     = settings.ALLOWED_ORIGINS,
    allow_credentials = True,
    allow_methods     = ["*"],
    allow_headers     = ["*"],
)

# Startup
@app.on_event("startup")
async def on_startup() -> None:
    print("\n" + "="*60)
    print("[APP] 🚀 AI Travel Booking Agent starting ...")
    settings.print_summary()
    print("="*60)
    init_db()
    print("[APP] ✅ Application ready → http://0.0.0.0:8000")
    print("[APP] 📚 Swagger UI      → http://0.0.0.0:8000/docs")
    print("="*60 + "\n")

# Routers
app.include_router(chat.router, prefix="/api", tags=["Chat"])

# Health
@app.get("/health", tags=["Health"])
async def health() -> dict:
    return {
        "status":        "ok",
        "version":       "3.0.0",
        "llm_provider":  settings.LLM_PROVIDER,
        "llm_model":     settings.OPENAI_MODEL if settings.LLM_PROVIDER == "openai" else settings.GEMINI_MODEL,
        "database":      settings.DB_NAME,
        "history_table": settings.TABLE_NAME,
        "vehicles":      settings.VEHICLE_TABLES,
    }