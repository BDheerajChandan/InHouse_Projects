# ============================================
# FILE: app/schemas/poll_schemas.py (COMPLETELY NEW)
# ============================================
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime


class ChoiceModel(BaseModel):
    choice_text: str
    votes: int = 0


class QuestionModel(BaseModel):
    question_text: str
    choices: List[ChoiceModel]


class PollCreate(BaseModel):
    creator_name: str = Field(..., min_length=1, max_length=255)
    poll_title: str = Field(..., min_length=1, max_length=500)
    questions: List[QuestionModel] = Field(..., min_items=1)


class ResponseSubmit(BaseModel):
    voter_name: str = Field(..., min_length=1, max_length=255)
    answers: Dict[int, int]  # {question_index: choice_index}


class PollResponse(BaseModel):
    poll_id: str
    creator_name: str
    poll_title: str
    questions: List[Dict[str, Any]]
    created_at: datetime


class PollDetailsResponse(BaseModel):
    poll_id: str
    creator_name: str
    poll_title: str
    questions: List[Dict[str, Any]]
    responses: List[Dict[str, Any]]
    total_responses: int
    created_at: datetime

