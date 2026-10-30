import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    # AI Configuration
    api_provider = Column(String(50), default="openai")  # openai, groq, openrouter, ollama, custom
    api_base_url = Column(String(255), default="https://api.openai.com/v1")
    model_name = Column(String(100), default="gpt-4o-mini")
    api_key_encrypted = Column(Text, nullable=True)  # Securely stored server-side
    temperature = Column(Float, default=0.7)
    max_tokens = Column(Integer, default=2048)
    
    # Personalization & UI
    theme = Column(String(20), default="dark")  # dark, light
    system_prompt = Column(Text, default="You are HAIDER AI, an advanced, highly intelligent personal AI assistant developed by Syed Haider Ali. You are helpful, precise, analytical, creative, and professional.")
    voice_speed = Column(Float, default=1.0)
    voice_accent = Column(String(50), default="default")
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="settings")
