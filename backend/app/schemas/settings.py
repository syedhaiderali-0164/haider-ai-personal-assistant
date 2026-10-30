from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class UserSettingsBase(BaseModel):
    api_provider: str = Field("openai", description="openai, groq, openrouter, ollama, custom")
    api_base_url: str = Field("https://api.openai.com/v1")
    model_name: str = Field("gpt-4o-mini")
    temperature: float = Field(0.7, ge=0.0, le=2.0)
    max_tokens: int = Field(2048, ge=64, le=16384)
    theme: str = Field("dark", description="dark or light")
    system_prompt: str = Field("You are HAIDER AI, an advanced, highly intelligent personal AI assistant developed by Syed Haider Ali. You are helpful, precise, analytical, creative, and professional.")
    voice_speed: float = Field(1.0, ge=0.5, le=2.0)
    voice_accent: str = Field("default")

class UserSettingsUpdate(BaseModel):
    api_provider: Optional[str] = None
    api_base_url: Optional[str] = None
    model_name: Optional[str] = None
    api_key: Optional[str] = None  # Frontend sends raw key only when updating
    temperature: Optional[float] = Field(None, ge=0.0, le=2.0)
    max_tokens: Optional[int] = Field(None, ge=64, le=16384)
    theme: Optional[str] = None
    system_prompt: Optional[str] = None
    voice_speed: Optional[float] = Field(None, ge=0.5, le=2.0)
    voice_accent: Optional[str] = None

class UserSettingsOut(UserSettingsBase):
    id: str
    user_id: str
    has_custom_api_key: bool
    api_key_masked: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class AIConnectionTestRequest(BaseModel):
    api_provider: Optional[str] = None
    api_base_url: Optional[str] = None
    model_name: Optional[str] = None
    api_key: Optional[str] = None

class AIConnectionTestResponse(BaseModel):
    success: bool
    message: str
    latency_ms: Optional[float] = None
    model_tested: Optional[str] = None
