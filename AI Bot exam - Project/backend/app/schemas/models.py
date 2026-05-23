from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# ── Auth Schemas ──────────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    email: str
    username: str

# ── Interview Config Schemas ───────────────────────────────────────────────────
class InterviewConfig(BaseModel):
    technologies: List[str] = []
    primary_skills: List[str] = []
    secondary_skills: List[str] = []
    experience_level: str = "Fresher"
    difficulty: str = "Medium"
    num_questions: int = Field(default=10, ge=1, le=50)
    total_time: int = Field(default=60, ge=10, le=180)
    question_types: List[str] = []
    self_validation_cutoff: float = Field(default=60.0, ge=0, le=100)
    company_name: Optional[str] = None
    interview_mode: str = "Hybrid"
    ai_personality: str = "Friendly"
    webcam_monitoring: bool = False
    voice_analytics: bool = True
    selected_llm: str = "openai"
    sarvam_language: str = "en-IN"

class InterviewConfigResponse(InterviewConfig):
    id: int
    user_id: int
    created_at: datetime

# ── Resume Schemas ─────────────────────────────────────────────────────────────
class ResumeAnalysisResponse(BaseModel):
    id: int
    filename: str
    ats_score: float
    ai_readiness_score: float
    ml_readiness_score: float
    genai_readiness_score: float
    strong_areas: List[str]
    weak_areas: List[str]
    missing_skills: List[str]
    extracted_skills: List[str]
    projects: List[Dict[str, Any]]
    certifications: List[str]
    experience_years: float
    education: List[Dict[str, Any]]
    parsed_data: Dict[str, Any]

# ── Session Schemas ────────────────────────────────────────────────────────────
class SessionCreateRequest(BaseModel):
    config_id: int
    resume_id: Optional[int] = None

class SessionResponse(BaseModel):
    id: int
    session_token: str
    status: str
    config_id: int
    resume_id: Optional[int]
    interview_strategy: Optional[Dict[str, Any]]
    created_at: datetime

# ── Question Schemas ───────────────────────────────────────────────────────────
class QuestionResponse(BaseModel):
    id: int
    question_number: int
    question_text: str
    question_type: str
    difficulty: str
    expected_keywords: List[str]
    expected_concepts: List[str]
    ideal_answer_summary: str
    followups: List[str]
    evaluation_criteria: List[str]
    company_style: Optional[str]
    audio_url: Optional[str]

# ── Answer Schemas ─────────────────────────────────────────────────────────────
class AnswerSubmit(BaseModel):
    session_id: int
    question_id: int
    answer_text: str
    time_taken: int = 0

class AnswerEvalResponse(BaseModel):
    score: float
    passed: bool
    confidence_score: float
    technical_depth: float
    communication_score: float
    missing_keywords: List[str]
    good_points: List[str]
    weak_points: List[str]
    improvements: List[str]
    hallucination_risk: str
    next_difficulty: str

# ── Voice Schemas ──────────────────────────────────────────────────────────────
class TTSRequest(BaseModel):
    text: str
    language: str = "en-IN"
    speaker: str = "meera"
    personality: str = "Friendly"

class STTResponse(BaseModel):
    transcript: str
    confidence: float
    language: str

class VoiceAnalyticsResponse(BaseModel):
    clarity_score: float
    confidence_score: float
    filler_words: List[str]
    filler_count: int
    professionalism_score: float
    communication_feedback: List[str]

# ── Analytics Schemas ──────────────────────────────────────────────────────────
class AnalyticsResponse(BaseModel):
    session_id: int
    overall_score: float
    technical_score: float
    communication_score: float
    confidence_score: float
    hiring_probability: float
    ai_ml_readiness: float
    genai_readiness: float
    coding_readiness: float
    resume_match_percent: float
    skill_scores: Dict[str, float]
    topic_scores: Dict[str, float]
    question_scores: List[Dict[str, Any]]
    strong_skills: List[str]
    weak_skills: List[str]
    improvement_roadmap: List[str]
    recommended_learning: List[str]
    company_readiness: Dict[str, float]
    final_verdict: str

# ── Report Schemas ─────────────────────────────────────────────────────────────
class FinalReportResponse(BaseModel):
    session_id: int
    report_data: Dict[str, Any]
    created_at: datetime