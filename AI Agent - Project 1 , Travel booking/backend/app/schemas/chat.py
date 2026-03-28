"""
schemas/chat.py — Pydantic request / response models.
"""
from __future__ import annotations
from pydantic import BaseModel, field_validator


class ChatRequest(BaseModel):
    message: str

    @field_validator("message")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("message must not be blank")
        return v.strip()


class ChatResponse(BaseModel):
    success:      bool
    message:      str
    tool_called:  str        | None = None
    arguments:    dict       | None = None
    booking:      dict       | None = None
    bookings:     list[dict] | None = None
    records:      list[dict] | None = None
    raw_response: str        | None = None

    model_config = {"arbitrary_types_allowed": True}