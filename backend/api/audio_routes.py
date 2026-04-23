from fastapi import APIRouter, UploadFile, File, HTTPException, Response
from services.elevenlabs_service import elevenlabs_service
import os
import uuid
import shutil
from typing import Dict

router = APIRouter(prefix="/audio", tags=["audio"])

TEMP_DIR = "temp_audio"
os.makedirs(TEMP_DIR, exist_ok=True)

@router.post("/stt")
async def speech_to_text(file: UploadFile = File(...)) -> Dict[str, str]:
    """
    Endpoint for Speech-to-Text transcription using ElevenLabs Scribe.
    """
    if not file.content_type.startswith("audio/"):
        raise HTTPException(status_code=400, detail="File must be an audio file.")

    temp_filename = f"{uuid.uuid4()}_{file.filename}"
    temp_path = os.path.join(TEMP_DIR, temp_filename)

    try:
        # Save uploaded file temporarily
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Transcribe using ElevenLabs
        transcription = await elevenlabs_service.transcribe_audio(temp_path)
        
        return {"text": transcription}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)

@router.post("/tts")
async def text_to_speech(data: Dict[str, str]):
    """
    Endpoint for Text-to-Speech generation using ElevenLabs.
    """
    text = data.get("text")
    if not text:
        raise HTTPException(status_code=400, detail="Text is required.")

    try:
        audio_content, mime_type = await elevenlabs_service.generate_speech(text)
        
        # Return the audio as a response with the correct mime type
        return Response(content=audio_content, media_type=mime_type)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
