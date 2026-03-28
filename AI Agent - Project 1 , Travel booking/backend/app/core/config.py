# core/config.py
"""
core/config.py
==============
All application settings loaded dynamically from .env file.

PostgreSQL naming rule enforced here once:
  ALL table names and database names are stored LOWERCASE.
  This prevents "relation does not exist" errors because PostgreSQL
  lowercases all unquoted identifiers internally.
  
  Rule: store lowercase in settings → use directly in SQL → always matches.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Locate .env at backend root regardless of working directory
_ENV_PATH = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=_ENV_PATH, override=True)

print(f"[Config] 📂 Loading .env from: {_ENV_PATH}")


class Settings:
    # ── LLM provider ─────────────────────────────────────────────
    LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "openai").strip().lower()

    # OpenAI
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "").strip()
    OPENAI_MODEL:   str = os.getenv("OPENAI_MODEL",   "gpt-3.5-turbo").strip()

    # Google Gemini
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()
    GEMINI_MODEL:   str = os.getenv("GEMINI_MODEL",   "gemini-1.5-flash").strip()

    # ── PostgreSQL ────────────────────────────────────────────────
    # DB_NAME is lowercased here — PostgreSQL stores db names lowercase
    DB_NAME:     str = os.getenv("DATABASE", "booking").strip().lower()
    DB_HOST:     str = os.getenv("HOST",     "localhost").strip()
    DB_PORT:     int = int(os.getenv("PORT", "5432"))
    DB_USER:     str = os.getenv("USER",     "postgres").strip()
    DB_PASSWORD: str = os.getenv("PASSWORD", "").strip()

    # TABLE_NAME is lowercased here ONCE — used directly in SQL without .lower() calls
    # .env has: TABLE_NAME=Travel_history  →  stored as "travel_history"
    TABLE_NAME: str = os.getenv("TABLE_NAME", "travel_history").strip().lower()

    # Vehicle tables — always lowercase (must match DB)
    VEHICLE_TABLES: list[str] = ["train", "bus", "flight", "car", "bike"]

    # ── CORS ──────────────────────────────────────────────────────
    @property
    def ALLOWED_ORIGINS(self) -> list[str]:
        raw = os.getenv(
            "ALLOWED_ORIGINS",
            "http://localhost:5173,http://localhost:3000",
        )
        return [o.strip() for o in raw.split(",") if o.strip()]

    def print_summary(self) -> None:
        print(f"[Config] ⚙️  LLM Provider : {self.LLM_PROVIDER.upper()}")
        print(f"[Config] 🤖 LLM Model    : {self.OPENAI_MODEL if self.LLM_PROVIDER == 'openai' else self.GEMINI_MODEL}")
        print(f"[Config] 🗄️  Database     : {self.DB_NAME} @ {self.DB_HOST}:{self.DB_PORT}")
        print(f"[Config] 📋 History Table: {self.TABLE_NAME}")
        print(f"[Config] 🚗 Vehicles     : {self.VEHICLE_TABLES}")

    def __repr__(self) -> str:
        return (
            f"<Settings provider={self.LLM_PROVIDER} "
            f"db={self.DB_NAME}@{self.DB_HOST}:{self.DB_PORT} "
            f"table={self.TABLE_NAME}>"
        )


settings = Settings()