from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import Response
import logging
from app.core.security import get_current_user
from app.services.sarvam_service import text_to_speech, speech_to_text, SARVAM_LANGUAGES, PERSONALITY_SPEAKERS
from app.schemas.models import TTSRequest

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/tts")
async def tts_endpoint(req: TTSRequest, current_user=Depends(get_current_user)):
    audio = await text_to_speech(req.text, req.language, req.personality)
    if not audio:
        raise HTTPException(status_code=503, detail="TTS service unavailable")
    return Response(content=audio, media_type="audio/wav")

@router.post("/stt")
async def stt_endpoint(
    file: UploadFile = File(...),
    language: str = "en-IN",
    current_user=Depends(get_current_user)
):
    audio_data = await file.read()
    result = await speech_to_text(audio_data, language)
    return result

@router.get("/languages")
async def get_languages():
    return {"languages": list(SARVAM_LANGUAGES.keys())}

@router.get("/speakers")
async def get_speakers():
    return {"speakers": PERSONALITY_SPEAKERS}