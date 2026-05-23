import httpx
import base64
import logging
import os
from app.core.config import settings

logger = logging.getLogger(__name__)

# Sarvam AI language codes
SARVAM_LANGUAGES = {
    "en-IN": "en-IN",
    "hi-IN": "hi-IN",
    "ta-IN": "ta-IN",
    "te-IN": "te-IN",
    "kn-IN": "kn-IN",
    "ml-IN": "ml-IN",
    "mr-IN": "mr-IN",
    "bn-IN": "bn-IN",
    "gu-IN": "gu-IN",
    "od-IN": "od-IN",
    "pa-IN": "pa-IN",
}

# Speaker personalities
PERSONALITY_SPEAKERS = {
    "Friendly": "meera",
    "Strict": "arvind",
    "FAANG Interviewer": "amol",
    "Technical Architect": "arjun",
    "HR Interviewer": "diya",
}

async def text_to_speech(text: str, language: str = "en-IN", personality: str = "Friendly") -> bytes:
    """Convert text to speech using Sarvam AI."""
    if not settings.SARVAM_API_KEY:
        logger.warning("Sarvam AI API key not configured")
        return b""

    speaker = PERSONALITY_SPEAKERS.get(personality, "meera")
    lang_code = SARVAM_LANGUAGES.get(language, "en-IN")

    payload = {
        "inputs": [text[:500]],  # Sarvam limit
        "target_language_code": lang_code,
        "speaker": speaker,
        "pitch": 0,
        "pace": 1.1,
        "loudness": 1.5,
        "speech_sample_rate": 22050,
        "enable_preprocessing": True,
        "model": "bulbul:v1",
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{settings.SARVAM_BASE_URL}{settings.SARVAM_TTS_ENDPOINT}",
                json=payload,
                headers={
                    "api-subscription-key": settings.SARVAM_API_KEY,
                    "Content-Type": "application/json",
                },
            )
            response.raise_for_status()
            data = response.json()
            # Sarvam returns base64 audio
            if "audios" in data and data["audios"]:
                audio_b64 = data["audios"][0]
                return base64.b64decode(audio_b64)
            return b""
    except Exception as e:
        logger.error(f"Sarvam TTS error: {e}")
        return b""

async def speech_to_text(audio_data: bytes, language: str = "en-IN") -> dict:
    """Convert speech to text using Sarvam AI."""
    if not settings.SARVAM_API_KEY:
        return {"transcript": "", "confidence": 0.0, "language": language}

    lang_code = SARVAM_LANGUAGES.get(language, "en-IN")

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            files = {"file": ("audio.wav", audio_data, "audio/wav")}
            data = {
                "language_code": lang_code,
                "model": "saarika:v2",
                "with_timestamps": False,
                "with_disfluencies": False,
            }
            response = await client.post(
                f"{settings.SARVAM_BASE_URL}{settings.SARVAM_STT_ENDPOINT}",
                files=files,
                data=data,
                headers={"api-subscription-key": settings.SARVAM_API_KEY},
            )
            response.raise_for_status()
            result = response.json()
            return {
                "transcript": result.get("transcript", ""),
                "confidence": result.get("confidence", 0.9),
                "language": lang_code,
            }
    except Exception as e:
        logger.error(f"Sarvam STT error: {e}")
        return {"transcript": "", "confidence": 0.0, "language": language}

async def save_audio_file(audio_bytes: bytes, filename: str) -> str:
    """Save audio bytes to file and return path."""
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(audio_bytes)
    return f"/uploads/{filename}"