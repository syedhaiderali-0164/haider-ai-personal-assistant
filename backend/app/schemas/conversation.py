from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class ConversationCreate(BaseModel):
    title: Optional[str] = "New Conversation"
    model: Optional[str] = None

class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    is_pinned: Optional[bool] = None

class MessageOut(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    tokens_used: int = 0
    model: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ConversationOut(BaseModel):
    id: str
    user_id: str
    title: str
    model: str
    is_pinned: bool
    created_at: datetime
    updated_at: datetime
    message_count: Optional[int] = 0
    last_message: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class ConversationDetailOut(ConversationOut):
    messages: List[MessageOut] = []
