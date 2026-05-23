import json
import logging
import uuid
from typing import Any, Dict, List, Optional, TypedDict
from app.services.llm_service import call_llm, parse_json_response

logger = logging.getLogger(__name__)

# ── State ──────────────────────────────────────────────────────────────────────
class InterviewState(TypedDict, total=False):
    config: Dict[str, Any]
    resume_analysis: Dict[str, Any]
    interview_strategy: Dict[str, Any]
    current_question: Dict[str, Any]
    previous_answers: List[Dict[str, Any]]
    current_answer: str
    evaluation: Dict[str, Any]
    voice_analytics: Dict[str, Any]
    final_report: Dict[str, Any]
    question_index: int
    difficulty_level: str
    session_id: int
    llm_provider: str
    error: Optional[str]

# ── Node 1: Config Analyzer ────────────────────────────────────────────────────
async def config_analyzer_node(state: InterviewState) -> InterviewState:
    """Convert Page 1 inputs into interview strategy."""
    config = state.get("config", {})
    llm = state.get("llm_provider", "openai")

    prompt = f"""You are a Senior AI Interview Strategist.

Analyze candidate interview preferences and generate a comprehensive interview strategy.

Generate:
- Interview strategy overview
- Difficulty progression mapping
- Skill priority order
- Question distribution by type
- Company-specific interview style notes
- Real-world focus areas
- Expected answer depth per experience level
- Topic weights (percentage allocation)

Return STRICT JSON only:
{{
  "strategy_overview": "",
  "difficulty_progression": [],
  "skill_priorities": [],
  "question_distribution": {{}},
  "company_style_notes": "",
  "focus_areas": [],
  "answer_depth_expectation": "",
  "topic_weights": {{}},
  "opening_question_type": "",
  "estimated_pass_threshold": 0
}}

Candidate Configuration:
{json.dumps(config, indent=2)}"""

    response = await call_llm(prompt, llm)
    strategy = parse_json_response(response)
    state["interview_strategy"] = strategy
    state["difficulty_level"] = config.get("difficulty", "Medium")
    return state

# ── Node 3: Question Generator ─────────────────────────────────────────────────
async def question_generator_node(state: InterviewState) -> InterviewState:
    """Generate adaptive interview question based on context."""
    config = state.get("config", {})
    resume = state.get("resume_analysis", {})
    strategy = state.get("interview_strategy", {})
    previous = state.get("previous_answers", [])
    difficulty = state.get("difficulty_level", config.get("difficulty", "Medium"))
    llm = state.get("llm_provider", "openai")
    q_index = state.get("question_index", 0)

    # Determine company-specific focus
    company = config.get("company_name", "General")
    company_styles = {
        "Google": "DSA, system design, deep algorithmic reasoning, distributed systems",
        "OpenAI": "Transformers, RAG, LLM architecture, fine-tuning, RLHF",
        "NVIDIA": "Deep Learning, CUDA, GPU optimization, computer vision, model efficiency",
        "Microsoft": "Cloud Azure, scalability, coding, behavioral, system design",
        "Amazon": "Leadership principles, coding, system design, customer focus",
        "Meta": "Large-scale systems, React, ML at scale, behavioral",
        "Infosys": "Core fundamentals, Java/Python, projects, communication",
        "TCS": "Aptitude, core CS, project explanation, communication",
        "Wipro": "Core CS, soft skills, domain knowledge, communication",
    }
    company_context = company_styles.get(company, "Well-rounded technical and behavioral questions")

    prev_summary = []
    for p in previous[-3:]:
        prev_summary.append({
            "question": p.get("question", ""),
            "score": p.get("score", 0),
            "difficulty": p.get("difficulty", ""),
        })

    prompt = f"""You are a Senior {company} AI interviewer conducting question #{q_index + 1}.

Generate ONE realistic, specific interview question.

Company Style: {company_context}
Current Difficulty: {difficulty}
Question Number: {q_index + 1}

Rules:
- Generate a SINGLE specific, non-generic question
- Match {company} interview style exactly
- Build on weaknesses from previous answers if any
- No repeated questions
- Include follow-up possibilities
- Make it realistic — like an actual {company} interview

Previous answers summary: {json.dumps(prev_summary)}

Candidate profile:
- Technologies: {config.get('technologies', [])}
- Skills: {config.get('primary_skills', [])}
- Experience: {config.get('experience_level', 'Fresher')}
- Strong areas: {resume.get('strong_areas', [])}
- Weak areas: {resume.get('weak_areas', [])}
- Question types requested: {config.get('question_types', [])}
- Personality: {config.get('ai_personality', 'Friendly')}

Return STRICT JSON only:
{{
  "question": "",
  "question_type": "",
  "difficulty": "",
  "expected_keywords": [],
  "expected_concepts": [],
  "ideal_answer_summary": "",
  "followups": [],
  "evaluation_criteria": [],
  "topic": "",
  "company_style": "{company}"
}}"""

    response = await call_llm(prompt, llm, temperature=0.8)
    question = parse_json_response(response)
    if not question.get("question"):
        question["question"] = f"Can you explain your approach to a key {config.get('technologies', ['Python'])[0] if config.get('technologies') else 'Python'} concept?"
    state["current_question"] = question
    return state

# ── Node 4: Answer Evaluator ───────────────────────────────────────────────────
async def answer_evaluator_node(state: InterviewState) -> InterviewState:
    """Evaluate candidate answer in real time."""
    question = state.get("current_question", {})
    answer = state.get("current_answer", "")
    config = state.get("config", {})
    llm = state.get("llm_provider", "openai")

    if not answer.strip():
        state["evaluation"] = {
            "score": 0, "pass": False, "confidence": 0, "technical_depth": 0,
            "communication_score": 0, "missing_keywords": question.get("expected_keywords", []),
            "good_points": [], "weak_points": ["No answer provided"],
            "improvements": ["Please provide an answer"], "hallucination_risk": "low",
            "next_difficulty": question.get("difficulty", "Medium"),
        }
        return state

    prompt = f"""You are an expert AI technical evaluator at {config.get('company_name', 'a top tech company')}.

Evaluate this candidate answer rigorously.

Analyze:
- Technical correctness and depth
- AI/ML accuracy and completeness
- Coding logic quality
- Communication clarity
- Architecture understanding
- Real-world applicability
- Keyword coverage

Return STRICT JSON only:
{{
  "score": 0,
  "pass": false,
  "confidence": 0,
  "technical_depth": 0,
  "communication_score": 0,
  "missing_keywords": [],
  "good_points": [],
  "weak_points": [],
  "improvements": [],
  "hallucination_risk": "low",
  "next_difficulty": ""
}}

Question: {question.get('question', '')}
Expected keywords: {question.get('expected_keywords', [])}
Expected concepts: {question.get('expected_concepts', [])}
Ideal answer: {question.get('ideal_answer_summary', '')}
Difficulty: {question.get('difficulty', 'Medium')}
Experience: {config.get('experience_level', 'Fresher')}

Candidate Answer:
{answer}"""

    response = await call_llm(prompt, llm)
    evaluation = parse_json_response(response)

    # Ensure defaults
    defaults = {"score": 0, "pass": False, "confidence": 50, "technical_depth": 50,
                "communication_score": 50, "missing_keywords": [], "good_points": [],
                "weak_points": [], "improvements": [], "hallucination_risk": "low",
                "next_difficulty": question.get("difficulty", "Medium")}
    for k, v in defaults.items():
        if k not in evaluation:
            evaluation[k] = v

    state["evaluation"] = evaluation

    # Adapt difficulty
    score = evaluation.get("score", 0)
    if score >= 80:
        state["difficulty_level"] = _increase_difficulty(state.get("difficulty_level", "Medium"))
    elif score < 40:
        state["difficulty_level"] = _decrease_difficulty(state.get("difficulty_level", "Medium"))

    return state

# ── Node 5: Voice Analytics ────────────────────────────────────────────────────
async def voice_analytics_node(state: InterviewState) -> InterviewState:
    """Analyze speech quality from transcribed text."""
    answer = state.get("current_answer", "")
    llm = state.get("llm_provider", "openai")

    if not answer.strip():
        state["voice_analytics"] = {
            "clarity_score": 0, "confidence_score": 0, "filler_words": [],
            "filler_count": 0, "professionalism_score": 0, "communication_feedback": [],
        }
        return state

    prompt = f"""Analyze this candidate's spoken/written response for communication quality.

Evaluate:
- Speech clarity (structure, coherence)
- Confidence (assertiveness, hedging)
- Filler words (um, uh, like, you know, basically, literally, etc.)
- Technical fluency (correct terminology usage)
- Communication quality overall
- Professionalism

Return STRICT JSON only:
{{
  "clarity_score": 0,
  "confidence_score": 0,
  "filler_words": [],
  "filler_count": 0,
  "professionalism_score": 0,
  "communication_feedback": [],
  "speech_rate_estimate": "normal",
  "structural_quality": ""
}}

Answer: {answer}"""

    response = await call_llm(prompt, llm)
    analytics = parse_json_response(response)
    state["voice_analytics"] = analytics
    return state

# ── Node 6: Final Report Generator ────────────────────────────────────────────
async def final_report_node(state: InterviewState) -> InterviewState:
    """Generate comprehensive interview analytics report."""
    config = state.get("config", {})
    resume = state.get("resume_analysis", {})
    answers = state.get("previous_answers", [])
    llm = state.get("llm_provider", "openai")

    if not answers:
        state["final_report"] = {"error": "No answers to analyze"}
        return state

    avg_score = sum(a.get("score", 0) for a in answers) / len(answers) if answers else 0
    scores_summary = [{"q": i+1, "score": a.get("score", 0), "type": a.get("question_type", "")} for i, a in enumerate(answers)]

    prompt = f"""Generate a comprehensive AI interview performance report.

Candidate Performance Summary:
- Total Questions: {len(answers)}
- Average Score: {avg_score:.1f}%
- Company Target: {config.get('company_name', 'General')}
- Experience Level: {config.get('experience_level', 'Fresher')}
- Technologies Tested: {config.get('technologies', [])}

Question-wise scores: {json.dumps(scores_summary)}

Resume Strengths: {resume.get('strong_areas', [])}
Resume Weaknesses: {resume.get('weak_areas', [])}

Generate detailed report. Return STRICT JSON only:
{{
  "overall_score": 0,
  "technical_score": 0,
  "ai_ml_readiness": 0,
  "genai_readiness": 0,
  "coding_readiness": 0,
  "communication_score": 0,
  "resume_strength_score": 0,
  "strong_areas": [],
  "weak_areas": [],
  "hiring_probability": 0,
  "company_readiness": {{}},
  "improvement_roadmap": [],
  "recommended_learning_path": [],
  "skill_scores": {{}},
  "topic_scores": {{}},
  "final_verdict": "",
  "interview_summary": "",
  "next_steps": []
}}"""

    response = await call_llm(prompt, llm)
    report = parse_json_response(response)
    state["final_report"] = report
    return state

# ── Helpers ────────────────────────────────────────────────────────────────────
def _increase_difficulty(current: str) -> str:
    order = ["Easy", "Medium", "Hard", "FAANG", "Research Level"]
    idx = order.index(current) if current in order else 1
    return order[min(idx + 1, len(order) - 1)]

def _decrease_difficulty(current: str) -> str:
    order = ["Easy", "Medium", "Hard", "FAANG", "Research Level"]
    idx = order.index(current) if current in order else 1
    return order[max(idx - 1, 0)]

# ── Main Interview Graph Runner ────────────────────────────────────────────────
async def run_config_analysis(config: dict, llm_provider: str = "openai") -> dict:
    state = InterviewState(config=config, llm_provider=llm_provider,
                           previous_answers=[], question_index=0)
    state = await config_analyzer_node(state)
    return state.get("interview_strategy", {})

async def generate_next_question(config: dict, resume_analysis: dict,
                                  previous_answers: list, question_index: int,
                                  difficulty: str, llm_provider: str = "openai") -> dict:
    state = InterviewState(
        config=config, resume_analysis=resume_analysis,
        previous_answers=previous_answers, question_index=question_index,
        difficulty_level=difficulty, llm_provider=llm_provider,
    )
    state = await question_generator_node(state)
    return state.get("current_question", {})

async def evaluate_answer(question: dict, answer: str, config: dict,
                           llm_provider: str = "openai") -> tuple:
    state = InterviewState(
        current_question=question, current_answer=answer,
        config=config, llm_provider=llm_provider,
        difficulty_level=question.get("difficulty", "Medium"),
    )
    state = await answer_evaluator_node(state)
    state = await voice_analytics_node(state)
    return state.get("evaluation", {}), state.get("voice_analytics", {}), state.get("difficulty_level", "Medium")

async def generate_final_report(config: dict, resume_analysis: dict,
                                 answers: list, llm_provider: str = "openai") -> dict:
    state = InterviewState(
        config=config, resume_analysis=resume_analysis,
        previous_answers=answers, llm_provider=llm_provider,
    )
    state = await final_report_node(state)
    return state.get("final_report", {})