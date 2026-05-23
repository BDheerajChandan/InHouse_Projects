from fastapi import APIRouter, Depends, HTTPException
import psycopg2.extras
import uuid, json, logging
from app.database.connection import get_db
from app.core.security import get_current_user
from app.schemas.models import InterviewConfig, AnswerSubmit
from app.workflows.interview_graph import (
    run_config_analysis, generate_next_question,
    evaluate_answer, generate_final_report
)
from app.services.sarvam_service import text_to_speech, save_audio_file

router = APIRouter()
logger = logging.getLogger(__name__)

# ── Config ────────────────────────────────────────────────────────────────────
@router.post("/config")
async def save_config(config: InterviewConfig, current_user=Depends(get_current_user), conn=Depends(get_db)):
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        INSERT INTO interview_configs
        (user_id, technologies, primary_skills, secondary_skills, experience_level,
         difficulty, num_questions, total_time, question_types, self_validation_cutoff,
         company_name, interview_mode, ai_personality, webcam_monitoring, voice_analytics,
         selected_llm, sarvam_language)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id
    """, (
        current_user["user_id"],
        json.dumps(config.technologies), json.dumps(config.primary_skills),
        json.dumps(config.secondary_skills), config.experience_level,
        config.difficulty, config.num_questions, config.total_time,
        json.dumps(config.question_types), config.self_validation_cutoff,
        config.company_name, config.interview_mode, config.ai_personality,
        config.webcam_monitoring, config.voice_analytics,
        config.selected_llm, config.sarvam_language
    ))
    config_id = cur.fetchone()["id"]
    conn.commit()
    return {"config_id": config_id, "message": "Configuration saved"}

@router.get("/config/{config_id}")
async def get_config(config_id: int, current_user=Depends(get_current_user), conn=Depends(get_db)):
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM interview_configs WHERE id=%s AND user_id=%s", (config_id, current_user["user_id"]))
    cfg = cur.fetchone()
    if not cfg:
        raise HTTPException(status_code=404, detail="Config not found")
    return cfg

# ── Session ───────────────────────────────────────────────────────────────────
@router.post("/session/create")
async def create_session(body: dict, current_user=Depends(get_current_user), conn=Depends(get_db)):
    config_id = body.get("config_id")
    resume_id = body.get("resume_id")
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Fetch config
    cur.execute("SELECT * FROM interview_configs WHERE id=%s AND user_id=%s", (config_id, current_user["user_id"]))
    cfg = cur.fetchone()
    if not cfg:
        raise HTTPException(status_code=404, detail="Config not found")

    config_dict = {
        "technologies": cfg["technologies"], "primary_skills": cfg["primary_skills"],
        "secondary_skills": cfg["secondary_skills"], "experience_level": cfg["experience_level"],
        "difficulty": cfg["difficulty"], "num_questions": cfg["num_questions"],
        "total_time": cfg["total_time"], "question_types": cfg["question_types"],
        "company_name": cfg["company_name"], "interview_mode": cfg["interview_mode"],
        "ai_personality": cfg["ai_personality"], "selected_llm": cfg["selected_llm"],
        "sarvam_language": cfg["sarvam_language"],
    }

    # Run Node 1: Config Analyzer
    strategy = await run_config_analysis(config_dict, cfg["selected_llm"])

    token = uuid.uuid4().hex
    cur.execute("""
        INSERT INTO interview_sessions
        (user_id, config_id, resume_id, session_token, status, interview_strategy)
        VALUES (%s,%s,%s,%s,'pending',%s) RETURNING id
    """, (current_user["user_id"], config_id, resume_id, token, json.dumps(strategy)))
    session_id = cur.fetchone()["id"]
    conn.commit()
    return {"session_id": session_id, "session_token": token, "strategy": strategy}

@router.post("/session/{session_id}/start")
async def start_session(session_id: int, current_user=Depends(get_current_user), conn=Depends(get_db)):
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("UPDATE interview_sessions SET status='active', start_time=NOW() WHERE id=%s AND user_id=%s RETURNING *",
                (session_id, current_user["user_id"]))
    session = cur.fetchone()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    conn.commit()
    return {"session_id": session_id, "status": "active"}

# ── Questions ─────────────────────────────────────────────────────────────────
@router.post("/session/{session_id}/next-question")
async def next_question(session_id: int, current_user=Depends(get_current_user), conn=Depends(get_db)):
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Fetch session + config
    cur.execute("""
        SELECT s.*, c.*, s.id as session_id
        FROM interview_sessions s
        JOIN interview_configs c ON s.config_id = c.id
        WHERE s.id=%s AND s.user_id=%s
    """, (session_id, current_user["user_id"]))
    row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Session not found")

    config_dict = {
        "technologies": row["technologies"], "primary_skills": row["primary_skills"],
        "secondary_skills": row["secondary_skills"], "experience_level": row["experience_level"],
        "difficulty": row["difficulty"], "num_questions": row["num_questions"],
        "company_name": row["company_name"], "interview_mode": row["interview_mode"],
        "ai_personality": row["ai_personality"], "question_types": row["question_types"],
        "selected_llm": row["selected_llm"],
    }

    # Fetch resume analysis if available
    resume_analysis = {}
    if row.get("resume_id"):
        cur.execute("SELECT parsed_data FROM resumes WHERE id=%s", (row["resume_id"],))
        r = cur.fetchone()
        if r and r["parsed_data"]:
            resume_analysis = r["parsed_data"]

    # Fetch previous answers
    cur.execute("""
        SELECT q.question_text, a.answer_text, a.score, q.difficulty, q.question_type
        FROM answers a
        JOIN questions q ON a.question_id = q.id
        WHERE a.session_id=%s ORDER BY a.id
    """, (session_id,))
    prev_answers = [dict(r) for r in cur.fetchall()]
    prev_for_gen = [{"question": p["question_text"], "score": p["score"], "difficulty": p["difficulty"], "question_type": p["question_type"]} for p in prev_answers]

    q_index = row["current_question_index"] or 0

    # Check if interview is complete
    if q_index >= row["num_questions"]:
        return {"completed": True, "message": "Interview complete"}

    # Generate question via Node 3
    question = await generate_next_question(
        config_dict, resume_analysis, prev_for_gen, q_index,
        row.get("difficulty", "Medium"), row["selected_llm"]
    )

    # Generate TTS audio
    audio_url = None
    try:
        audio_bytes = await text_to_speech(
            question.get("question", ""),
            language=row.get("sarvam_language", "en-IN"),
            personality=row.get("ai_personality", "Friendly")
        )
        if audio_bytes:
            fname = f"q_{session_id}_{q_index}.wav"
            audio_url = await save_audio_file(audio_bytes, fname)
    except Exception as e:
        logger.warning(f"TTS failed: {e}")

    # Save question to DB
    cur.execute("""
        INSERT INTO questions
        (session_id, question_number, question_text, question_type, difficulty,
         expected_keywords, expected_concepts, ideal_answer_summary, followups,
         evaluation_criteria, company_style, audio_url)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id
    """, (
        session_id, q_index + 1,
        question.get("question", ""), question.get("question_type", ""),
        question.get("difficulty", "Medium"),
        json.dumps(question.get("expected_keywords", [])),
        json.dumps(question.get("expected_concepts", [])),
        question.get("ideal_answer_summary", ""),
        json.dumps(question.get("followups", [])),
        json.dumps(question.get("evaluation_criteria", [])),
        question.get("company_style", ""), audio_url
    ))
    q_id = cur.fetchone()["id"]

    cur.execute("UPDATE interview_sessions SET current_question_index=%s WHERE id=%s", (q_index + 1, session_id))
    conn.commit()

    return {
        "question_id": q_id,
        "question_number": q_index + 1,
        "total_questions": row["num_questions"],
        "question_text": question.get("question", ""),
        "question_type": question.get("question_type", ""),
        "difficulty": question.get("difficulty", "Medium"),
        "expected_keywords": question.get("expected_keywords", []),
        "expected_concepts": question.get("expected_concepts", []),
        "followups": question.get("followups", []),
        "evaluation_criteria": question.get("evaluation_criteria", []),
        "company_style": question.get("company_style", ""),
        "audio_url": audio_url,
        "completed": False,
    }

# ── Answers ───────────────────────────────────────────────────────────────────
@router.post("/answer/submit")
async def submit_answer(body: AnswerSubmit, current_user=Depends(get_current_user), conn=Depends(get_db)):
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    # Get question
    cur.execute("SELECT * FROM questions WHERE id=%s AND session_id=%s", (body.question_id, body.session_id))
    question = cur.fetchone()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")

    # Get session config
    cur.execute("""
        SELECT s.*, c.selected_llm, c.company_name, c.experience_level, c.self_validation_cutoff
        FROM interview_sessions s JOIN interview_configs c ON s.config_id=c.id
        WHERE s.id=%s AND s.user_id=%s
    """, (body.session_id, current_user["user_id"]))
    session = cur.fetchone()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    config_dict = {"company_name": session["company_name"], "experience_level": session["experience_level"]}

    q_dict = {
        "question": question["question_text"],
        "expected_keywords": question["expected_keywords"],
        "expected_concepts": question["expected_concepts"],
        "ideal_answer_summary": question["ideal_answer_summary"],
        "difficulty": question["difficulty"],
    }

    # Evaluate via Node 4 + 5
    evaluation, voice_metrics, new_difficulty = await evaluate_answer(
        q_dict, body.answer_text, config_dict, session["selected_llm"]
    )

    # Save answer
    cur.execute("""
        INSERT INTO answers
        (session_id, question_id, answer_text, score, passed, confidence_score,
         technical_depth, communication_score, missing_keywords, good_points,
         weak_points, improvements, hallucination_risk, next_difficulty, time_taken)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id
    """, (
        body.session_id, body.question_id, body.answer_text,
        evaluation.get("score", 0), evaluation.get("pass", False),
        evaluation.get("confidence", 0), evaluation.get("technical_depth", 0),
        evaluation.get("communication_score", 0),
        json.dumps(evaluation.get("missing_keywords", [])),
        json.dumps(evaluation.get("good_points", [])),
        json.dumps(evaluation.get("weak_points", [])),
        json.dumps(evaluation.get("improvements", [])),
        evaluation.get("hallucination_risk", "low"),
        evaluation.get("next_difficulty", question["difficulty"]),
        body.time_taken
    ))
    answer_id = cur.fetchone()["id"]

    # Save voice metrics
    cur.execute("""
        INSERT INTO voice_metrics
        (session_id, answer_id, clarity_score, confidence_score, filler_words,
         filler_count, professionalism_score, communication_feedback)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
    """, (
        body.session_id, answer_id,
        voice_metrics.get("clarity_score", 0), voice_metrics.get("confidence_score", 0),
        json.dumps(voice_metrics.get("filler_words", [])),
        voice_metrics.get("filler_count", 0),
        voice_metrics.get("professionalism_score", 0),
        json.dumps(voice_metrics.get("communication_feedback", []))
    ))

    conn.commit()

    cutoff = session.get("self_validation_cutoff", 60)
    passed_cutoff = evaluation.get("score", 0) >= cutoff

    return {
        "answer_id": answer_id,
        "score": evaluation.get("score", 0),
        "passed": evaluation.get("pass", False),
        "passed_cutoff": passed_cutoff,
        "confidence_score": evaluation.get("confidence", 0),
        "technical_depth": evaluation.get("technical_depth", 0),
        "communication_score": evaluation.get("communication_score", 0),
        "missing_keywords": evaluation.get("missing_keywords", []),
        "good_points": evaluation.get("good_points", []),
        "weak_points": evaluation.get("weak_points", []),
        "improvements": evaluation.get("improvements", []),
        "hallucination_risk": evaluation.get("hallucination_risk", "low"),
        "next_difficulty": new_difficulty,
        "voice_metrics": voice_metrics,
    }

# ── End Interview & Report ────────────────────────────────────────────────────
@router.post("/session/{session_id}/end")
async def end_interview(session_id: int, current_user=Depends(get_current_user), conn=Depends(get_db)):
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    cur.execute("""
        SELECT s.*, c.*
        FROM interview_sessions s JOIN interview_configs c ON s.config_id=c.id
        WHERE s.id=%s AND s.user_id=%s
    """, (session_id, current_user["user_id"]))
    session = cur.fetchone()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Get all answers
    cur.execute("""
        SELECT q.question_text, q.question_type, q.difficulty,
               a.answer_text, a.score, a.confidence_score, a.technical_depth, a.communication_score,
               a.missing_keywords, a.good_points, a.weak_points
        FROM answers a JOIN questions q ON a.question_id=q.id
        WHERE a.session_id=%s ORDER BY a.id
    """, (session_id,))
    answers = [dict(r) for r in cur.fetchall()]

    # Fetch resume analysis
    resume_analysis = {}
    if session.get("resume_id"):
        cur.execute("SELECT parsed_data FROM resumes WHERE id=%s", (session["resume_id"],))
        r = cur.fetchone()
        if r and r["parsed_data"]:
            resume_analysis = r["parsed_data"]

    config_dict = {
        "technologies": session["technologies"], "experience_level": session["experience_level"],
        "company_name": session["company_name"], "difficulty": session["difficulty"],
    }

    # Generate final report via Node 6
    report = await generate_final_report(config_dict, resume_analysis, answers, session["selected_llm"])

    avg_score = sum(a.get("score", 0) for a in answers) / len(answers) if answers else 0

    cur.execute("""
        UPDATE interview_sessions SET
            status='completed', end_time=NOW(),
            overall_score=%s, final_report=%s
        WHERE id=%s
    """, (avg_score, json.dumps(report), session_id))

    # Save analytics
    cur.execute("""
        INSERT INTO analytics
        (session_id, user_id, skill_scores, topic_scores, question_scores,
         ai_ml_readiness, genai_readiness, coding_readiness, resume_match_percent,
         strong_skills, weak_skills, improvement_roadmap, recommended_learning,
         company_readiness, final_verdict)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """, (
        session_id, current_user["user_id"],
        json.dumps(report.get("skill_scores", {})),
        json.dumps(report.get("topic_scores", {})),
        json.dumps([{"q": i+1, "score": a.get("score", 0)} for i, a in enumerate(answers)]),
        report.get("ai_ml_readiness", avg_score),
        report.get("genai_readiness", avg_score),
        report.get("coding_readiness", avg_score),
        report.get("resume_strength_score", 0),
        json.dumps(report.get("strong_areas", [])),
        json.dumps(report.get("weak_areas", [])),
        json.dumps(report.get("improvement_roadmap", [])),
        json.dumps(report.get("recommended_learning_path", [])),
        json.dumps(report.get("company_readiness", {})),
        report.get("final_verdict", "")
    ))

    cur.execute("""
        INSERT INTO reports (session_id, user_id, report_data)
        VALUES (%s,%s,%s)
    """, (session_id, current_user["user_id"], json.dumps(report)))

    conn.commit()
    return {"session_id": session_id, "status": "completed", "report": report, "overall_score": avg_score}

@router.get("/session/{session_id}/report")
async def get_report(session_id: int, current_user=Depends(get_current_user), conn=Depends(get_db)):
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM reports WHERE session_id=%s AND user_id=%s ORDER BY created_at DESC LIMIT 1",
                (session_id, current_user["user_id"]))
    r = cur.fetchone()
    if not r:
        raise HTTPException(status_code=404, detail="Report not found")
    return r

@router.get("/sessions")
async def list_sessions(current_user=Depends(get_current_user), conn=Depends(get_db)):
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("""
        SELECT s.id, s.status, s.overall_score, s.start_time, s.end_time,
               c.company_name, c.difficulty, c.num_questions
        FROM interview_sessions s JOIN interview_configs c ON s.config_id=c.id
        WHERE s.user_id=%s ORDER BY s.created_at DESC
    """, (current_user["user_id"],))
    return cur.fetchall()