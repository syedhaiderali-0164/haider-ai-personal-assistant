from typing import Optional, List, Dict
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class MessageBase(BaseModel):
    role: str
    content: str
    model: Optional[str] = None

class MessageCreate(MessageBase):
    pass

class MessageOut(MessageBase):
    id: str
    conversation_id: str
    tokens_used: int = 0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ChatStreamRequest(BaseModel):
    conversation_id: Optional[str] = None
    message: str = Field(..., min_length=1)
    model: Optional[str] = None
    temperature: Optional[float] = None
    system_prompt: Optional[str] = None

class MessageEditRequest(BaseModel):
    content: str = Field(..., min_length=1)
