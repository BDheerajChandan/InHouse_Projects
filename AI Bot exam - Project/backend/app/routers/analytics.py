from fastapi import APIRouter, Depends, HTTPException
import psycopg2.extras
from app.database.connection import get_db
from app.core.security import get_current_user

router = APIRouter()

@router.get("/session/{session_id}")
async def session_analytics(session_id: int, current_user=Depends(get_current_user), conn=Depends(get_db)):
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM analytics WHERE session_id=%s AND user_id=%s", (session_id, current_user["user_id"]))
    row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Analytics not found")
    return row

@router.get("/session/{session_id}/questions")
async def question_analytics(session_id: int, current_user=Depends(get_current_user), conn=Depends(get_db)):
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT q.question_number, q.question_text, q.question_type, q.difficulty,
               a.score, a.passed, a.confidence_score, a.technical_depth,
               a.communication_score, a.missing_keywords, a.good_points, a.weak_points,
               a.improvements, a.time_taken,
               vm.clarity_score, vm.filler_words, vm.filler_count, vm.professionalism_score
        FROM questions q
        LEFT JOIN answers a ON a.question_id=q.id AND a.session_id=q.session_id
        LEFT JOIN voice_metrics vm ON vm.answer_id=a.id
        WHERE q.session_id=%s ORDER BY q.question_number
    """, (session_id,))
    return cur.fetchall()

@router.get("/dashboard")
async def dashboard(current_user=Depends(get_current_user), conn=Depends(get_db)):
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT COUNT(*) as total_sessions,
               AVG(overall_score) as avg_score,
               MAX(overall_score) as best_score
        FROM interview_sessions WHERE user_id=%s AND status='completed'
    """, (current_user["user_id"],))
    stats = cur.fetchone()
    cur.execute("""
        SELECT s.id, s.overall_score, s.start_time, c.company_name, c.difficulty
        FROM interview_sessions s JOIN interview_configs c ON s.config_id=c.id
        WHERE s.user_id=%s AND s.status='completed' ORDER BY s.start_time DESC LIMIT 5
    """, (current_user["user_id"],))
    recent = cur.fetchall()
    return {"stats": stats, "recent_sessions": recent}