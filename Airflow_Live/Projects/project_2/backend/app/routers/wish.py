# Projects/project_2/backend/app/routers/wish.py
from fastapi import APIRouter

router = APIRouter()


@router.get("/wish")
def wish():
    return {"message": "How are you!"}