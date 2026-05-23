from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
import psycopg2.extras
import os, uuid, json, logging
from app.database.connection import get_db
from app.core.security import get_current_user
from app.core.config import settings
from app.services.resume_service import extract_text_from_file, analyze_resume

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/upload")
async def upload_resume(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
    conn=Depends(get_db)
):
    if file.content_type not in ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/msword"]:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX files allowed")
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    ext = file.filename.split(".")[-1]
    filename = f"resume_{current_user['user_id']}_{uuid.uuid4().hex[:8]}.{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")
    with open(file_path, "wb") as f:
        f.write(content)
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute(
        "INSERT INTO resumes (user_id, filename, file_path) VALUES (%s,%s,%s) RETURNING id",
        (current_user["user_id"], file.filename, file_path)
    )
    resume_id = cur.fetchone()["id"]
    conn.commit()
    return {"resume_id": resume_id, "filename": file.filename, "message": "Uploaded successfully"}

@router.post("/analyze/{resume_id}")
async def analyze(resume_id: int, current_user=Depends(get_current_user), conn=Depends(get_db)):
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM resumes WHERE id=%s AND user_id=%s", (resume_id, current_user["user_id"]))
    resume = cur.fetchone()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    raw_text = await extract_text_from_file(resume["file_path"], resume["filename"])
    if not raw_text.strip():
        raise HTTPException(status_code=422, detail="Could not extract text from resume")
    parsed = await analyze_resume(raw_text)
    cur.execute("""
        UPDATE resumes SET
            raw_text=%s, parsed_data=%s,
            ats_score=%s, ai_readiness_score=%s, ml_readiness_score=%s, genai_readiness_score=%s,
            strong_areas=%s, weak_areas=%s, missing_skills=%s, extracted_skills=%s,
            projects=%s, certifications=%s, experience_years=%s, education=%s
        WHERE id=%s
    """, (
        raw_text, json.dumps(parsed),
        parsed.get("ats_score", 0), parsed.get("ai_readiness_score", 0),
        parsed.get("ml_readiness_score", 0), parsed.get("genai_readiness_score", 0),
        json.dumps(parsed.get("strong_areas", [])), json.dumps(parsed.get("weak_areas", [])),
        json.dumps(parsed.get("missing_skills", [])), json.dumps(parsed.get("all_extracted_skills", [])),
        json.dumps(parsed.get("projects", [])), json.dumps(parsed.get("certifications", [])),
        parsed.get("experience_years", 0), json.dumps(parsed.get("education", [])),
        resume_id
    ))
    conn.commit()
    return {
        "resume_id": resume_id,
        "ats_score": parsed.get("ats_score", 0),
        "ai_readiness_score": parsed.get("ai_readiness_score", 0),
        "ml_readiness_score": parsed.get("ml_readiness_score", 0),
        "genai_readiness_score": parsed.get("genai_readiness_score", 0),
        "strong_areas": parsed.get("strong_areas", []),
        "weak_areas": parsed.get("weak_areas", []),
        "missing_skills": parsed.get("missing_skills", []),
        "extracted_skills": parsed.get("all_extracted_skills", []),
        "projects": parsed.get("projects", []),
        "certifications": parsed.get("certifications", []),
        "experience_years": parsed.get("experience_years", 0),
        "education": parsed.get("education", []),
        "parsed_data": parsed,
    }

@router.get("/list")
async def list_resumes(current_user=Depends(get_current_user), conn=Depends(get_db)):
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT id, filename, ats_score, ai_readiness_score, created_at FROM resumes WHERE user_id=%s ORDER BY created_at DESC", (current_user["user_id"],))
    return cur.fetchall()

@router.get("/{resume_id}")
async def get_resume(resume_id: int, current_user=Depends(get_current_user), conn=Depends(get_db)):
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM resumes WHERE id=%s AND user_id=%s", (resume_id, current_user["user_id"]))
    r = cur.fetchone()
    if not r:
        raise HTTPException(status_code=404, detail="Resume not found")
    return r