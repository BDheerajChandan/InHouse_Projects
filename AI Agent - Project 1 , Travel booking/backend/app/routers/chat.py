# routers/chat.py

"""
routers/chat.py — POST /api/chat
"""
from fastapi import APIRouter
from app.schemas.chat import ChatRequest, ChatResponse
from app.agents.booking_agent import run_agent

router = APIRouter()


@router.post(
    "/chat",
    response_model=ChatResponse,
    summary="Chat with AI Booking Agent",
    description=(
        "Send a natural-language travel request. "
        "The agent understands greetings, booking, history, updates, and cancellations."
    ),
)
async def chat(request: ChatRequest) -> ChatResponse:
    print(f"\n[Router] POST /api/chat | message={request.message!r}")
    result = run_agent(request.message)

    result.setdefault("tool_called",  None)
    result.setdefault("arguments",    None)
    result.setdefault("booking",      None)
    result.setdefault("bookings",     None)
    result.setdefault("records",      None)
    result.setdefault("raw_response", None)

    print(f"[Router] Response: success={result['success']}")
    return ChatResponse(**result)