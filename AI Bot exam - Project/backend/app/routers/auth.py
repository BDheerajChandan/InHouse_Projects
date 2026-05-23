from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
import psycopg2.extras
import logging
from app.database.connection import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, get_current_user
from app.schemas.models import UserRegister, UserLogin, TokenResponse

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/register", response_model=TokenResponse)
async def register(user: UserRegister, conn=Depends(get_db)):
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT id FROM users WHERE email=%s", (user.email,))
    if cur.fetchone():
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = get_password_hash(user.password)
    cur.execute(
        "INSERT INTO users (email, username, hashed_password, full_name) VALUES (%s,%s,%s,%s) RETURNING id",
        (user.email, user.username, hashed, user.full_name)
    )
    new_id = cur.fetchone()["id"]
    conn.commit()
    token = create_access_token({"sub": str(new_id), "email": user.email})
    return TokenResponse(access_token=token, user_id=new_id, email=user.email, username=user.username)

@router.post("/login", response_model=TokenResponse)
async def login(form: OAuth2PasswordRequestForm = Depends(), conn=Depends(get_db)):
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM users WHERE email=%s", (form.username,))
    user = cur.fetchone()
    if not user or not verify_password(form.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user["id"]), "email": user["email"]})
    return TokenResponse(access_token=token, user_id=user["id"], email=user["email"], username=user["username"])

@router.get("/me")
async def me(current_user=Depends(get_current_user), conn=Depends(get_db)):
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT id, email, username, full_name, created_at FROM users WHERE id=%s", (current_user["user_id"],))
    return cur.fetchone()