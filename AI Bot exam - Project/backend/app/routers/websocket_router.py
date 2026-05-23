from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json, logging, asyncio
from app.core.security import decode_token
from app.workflows.interview_graph import evaluate_answer

router = APIRouter()
logger = logging.getLogger(__name__)

# Track active connections
active_connections: dict = {}

@router.websocket("/interview/{session_id}")
async def interview_ws(websocket: WebSocket, session_id: int):
    await websocket.accept()
    active_connections[session_id] = websocket
    logger.info(f"WebSocket connected: session {session_id}")
    try:
        # Send welcome
        await websocket.send_json({"type": "connected", "session_id": session_id, "message": "WebSocket ready"})
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            msg_type = msg.get("type")

            if msg_type == "ping":
                await websocket.send_json({"type": "pong"})

            elif msg_type == "transcription_update":
                # Live transcription relay
                await websocket.send_json({
                    "type": "transcription",
                    "text": msg.get("text", ""),
                    "is_final": msg.get("is_final", False),
                })

            elif msg_type == "live_evaluate":
                # Real-time partial evaluation
                question = msg.get("question", {})
                partial_answer = msg.get("answer", "")
                config = msg.get("config", {})
                llm = msg.get("llm_provider", "openai")
                if len(partial_answer) > 50:
                    try:
                        evaluation, voice, _ = await evaluate_answer(question, partial_answer, config, llm)
                        await websocket.send_json({
                            "type": "live_score",
                            "score": evaluation.get("score", 0),
                            "confidence": evaluation.get("confidence", 0),
                            "missing_keywords": evaluation.get("missing_keywords", [])[:3],
                        })
                    except Exception as e:
                        logger.error(f"Live eval error: {e}")

            elif msg_type == "voice_activity":
                await websocket.send_json({
                    "type": "voice_status",
                    "active": msg.get("active", False),
                })

            elif msg_type == "disconnect":
                break

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: session {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
    finally:
        active_connections.pop(session_id, None)
        try:
            await websocket.close()
        except:
            pass

async def broadcast_to_session(session_id: int, message: dict):
    ws = active_connections.get(session_id)
    if ws:
        try:
            await ws.send_json(message)
        except Exception as e:
            logger.error(f"Broadcast error: {e}")