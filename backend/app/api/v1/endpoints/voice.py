from fastapi import APIRouter, Depends, UploadFile, File
from backend.app.models.user import User
from backend.app.api.deps import get_current_user

router = APIRouter()

@router.get("/status")
async def voice_status(current_user: User = Depends(get_current_user)):
    return {
        "browser_speech_recognition": "supported",
        "browser_speech_synthesis": "supported",
        "backend_whisper_ready": False,
        "message": "HAIDER AI Voice Assistant utilizes browser Web Speech API for low-latency voice input & speech synthesis, with server-side AI response generation."
    }
