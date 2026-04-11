# Projects/project_2/backend/app/main.py
import json
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.routers import greet, wish

load_dotenv()

PROJECT_KEY = os.getenv("PROJECT_KEY", "project_2")
CONFIG_PATH = os.getenv(
    "PROJECT_CONFIG_PATH",
    "/opt/airflow/Projects/project_config.json"
)

with open(CONFIG_PATH, "r") as f:
    config = json.load(f)

project_cfg   = config[PROJECT_KEY]
PROJECT_NAME  = project_cfg["name"]
FRONTEND_PORT = project_cfg["frontend"]["port"]
FRONTEND_HOST = project_cfg["frontend"]["host"]
BACKEND_PORT  = project_cfg["backend"]["port"]
BACKEND_HOST  = project_cfg["backend"]["host"]

app = FastAPI(title=PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        f"http://{FRONTEND_HOST}:{FRONTEND_PORT}",
        f"http://localhost:{FRONTEND_PORT}",
        f"http://0.0.0.0:{FRONTEND_PORT}",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(greet.router)
app.include_router(wish.router)


@app.get("/")
def root():
    return {"message": f"Welcome to {PROJECT_NAME}"}


@app.get("/config")
def get_config():
    """
    Expose project config to the frontend dynamically.
    Frontend services/config.js fetches this on load — no .env needed.
    """
    return {
        "projectKey":   PROJECT_KEY,
        "projectName":  PROJECT_NAME,
        "backendHost":  BACKEND_HOST,
        "backendPort":  BACKEND_PORT,
        "frontendHost": FRONTEND_HOST,
        "frontendPort": FRONTEND_PORT,
    }