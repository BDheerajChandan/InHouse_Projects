# app.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.graph_router import router as graph_router

app = FastAPI(title="LangGraph API")

# Allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173/","*","http://localhost:8000/"],  # change to your frontend URL in prod
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(graph_router)