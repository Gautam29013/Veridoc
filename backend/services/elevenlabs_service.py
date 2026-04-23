from elevenlabs.client import ElevenLabs
import os
import logging
from config import ELEVENLABS_API_KEY

logger = logging.getLogger(__name__)

class ElevenLabsService:
    def __init__(self):
        if not ELEVENLABS_API_KEY:
            logger.warning("ELEVENLABS_API_KEY not found in environment variables.")
            self.client = None
        else:
            self.client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
        
        # Default voice and models
        self.voice_id = "JBFqnCBsd6RMkjVDRZzb" # Default voice (George)
        self.tts_model = "eleven_multilingual_v2"
        self.stt_model = "scribe_v2"

    async def generate_speech(self, text: str) -> tuple[bytes, str]:
        """
        Generates speech using ElevenLabs TTS.
        Returns (audio_data, mime_type).
        """
        if not self.client:
            raise ValueError("ElevenLabs Client not initialized. Check ELEVENLABS_API_KEY.")

        try:
            # Generate audio from text
            # The SDK returns a generator, we need to collect it into bytes
            audio_generator = self.client.text_to_speech.convert(
                text=text,
                voice_id=self.voice_id,
                model_id=self.tts_model,
            )
            
            audio_data = b"".join(audio_generator)
            return audio_data, "audio/mpeg" # ElevenLabs returns mp3 by default
            
        except Exception as e:
            logger.error(f"Error in ElevenLabs generate_speech: {e}")
            raise

    async def transcribe_audio(self, audio_file_path: str) -> str:
        """
        Transcribes audio using ElevenLabs Scribe (STT).
        """
        if not self.client:
            raise ValueError("ElevenLabs Client not initialized. Check ELEVENLABS_API_KEY.")

        try:
            with open(audio_file_path, "rb") as audio_file:
                result = self.client.speech_to_text.convert(
                    file=audio_file,
                    model_id=self.stt_model,
                )
            
            return result.text
        except Exception as e:
            logger.error(f"Error in ElevenLabs transcribe_audio: {e}")
            raise

elevenlabs_service = ElevenLabsService()
