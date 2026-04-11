# Projects/project_1/backend/run.py
import json
import os
import uvicorn
from dotenv import load_dotenv

load_dotenv()

PROJECT_KEY = os.getenv("PROJECT_KEY", "project_1")
CONFIG_PATH = os.getenv(
    "PROJECT_CONFIG_PATH",
    "/opt/airflow/Projects/project_config.json"
)

with open(CONFIG_PATH, "r") as f:
    config = json.load(f)

project_cfg = config[PROJECT_KEY]
port        = project_cfg["backend"]["port"]   # fully dynamic from JSON

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",   # bind all interfaces inside Docker
        port=port,
        reload=True,
    )