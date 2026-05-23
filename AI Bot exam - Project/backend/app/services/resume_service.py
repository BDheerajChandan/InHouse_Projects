import os
import logging
import json
from typing import Dict, Any
from app.services.llm_service import call_llm, parse_json_response
from app.core.config import settings

logger = logging.getLogger(__name__)

async def extract_text_from_file(file_path: str, filename: str) -> str:
    """Extract text from PDF or DOCX files."""
    ext = filename.lower().split(".")[-1]
    text = ""
    try:
        if ext == "pdf":
            text = _extract_pdf(file_path)
        elif ext in ["docx", "doc"]:
            text = _extract_docx(file_path)
        else:
            with open(file_path, "r", errors="ignore") as f:
                text = f.read()
    except Exception as e:
        logger.error(f"Text extraction error: {e}")
    return text

def _extract_pdf(file_path: str) -> str:
    try:
        import pdfplumber
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        return text
    except ImportError:
        pass
    try:
        import PyPDF2
        text = ""
        with open(file_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text += page.extract_text() or ""
        return text
    except Exception as e:
        logger.error(f"PDF extraction fallback error: {e}")
        return ""

def _extract_docx(file_path: str) -> str:
    try:
        from docx import Document
        doc = Document(file_path)
        return "\n".join([para.text for para in doc.paragraphs if para.text.strip()])
    except Exception as e:
        logger.error(f"DOCX extraction error: {e}")
        return ""

async def analyze_resume(resume_text: str, llm_provider: str = "openai") -> Dict[str, Any]:
    """Use LLM Node 2 to analyze resume deeply."""
    prompt = f"""You are an advanced ATS and AI resume analyzer.

Analyze the resume deeply and extract all information.

Extract:
- Skills (programming languages, frameworks, tools)
- AI/ML tools and technologies
- Databases
- Cloud tools
- Projects (name, description, tech stack)
- Certifications
- Achievements
- Education (degree, institution, year)
- Work experience (company, role, duration, responsibilities)
- GitHub, LinkedIn URLs

Also identify:
- Strong areas (what candidate excels at)
- Weak areas (gaps or shallow coverage)
- Missing fundamentals for AI/ML roles
- Interview focus areas
- ATS score (0-100) based on keyword density, format, completeness
- AI readiness score (0-100)
- ML readiness score (0-100)
- GenAI readiness score (0-100)
- Experience years (total)

Return STRICT JSON only with these exact keys:
{{
  "skills": [],
  "ai_tools": [],
  "programming_languages": [],
  "frameworks": [],
  "databases": [],
  "cloud_tools": [],
  "projects": [{{"name": "", "description": "", "tech_stack": []}}],
  "certifications": [],
  "achievements": [],
  "education": [{{"degree": "", "institution": "", "year": ""}}],
  "experience": [{{"company": "", "role": "", "duration": "", "responsibilities": []}}],
  "github_url": "",
  "linkedin_url": "",
  "strong_areas": [],
  "weak_areas": [],
  "missing_skills": [],
  "interview_focus_areas": [],
  "ats_score": 0,
  "ai_readiness_score": 0,
  "ml_readiness_score": 0,
  "genai_readiness_score": 0,
  "experience_years": 0,
  "all_extracted_skills": []
}}

Resume:
{resume_text[:6000]}"""

    response = await call_llm(prompt, llm_provider)
    return parse_json_response(response)