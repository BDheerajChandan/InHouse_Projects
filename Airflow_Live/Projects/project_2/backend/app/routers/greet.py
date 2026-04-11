# Projects/project_2/backend/app/routers/greet.py
from fastapi import APIRouter

router = APIRouter()


@router.get("/greet")
def greet():
    return {"message": "Hi good night"}