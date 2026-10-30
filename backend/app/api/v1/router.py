from fastapi import APIRouter
from backend.app.api.v1.endpoints import (
    auth,
    users,
    settings,
    conversations,
    messages,
    chat,
    documents,
    tasks,
    tools,
    voice
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(settings.router, prefix="/settings", tags=["AI Settings"])
api_router.include_router(conversations.router, prefix="/conversations", tags=["Conversations"])
api_router.include_router(messages.router, prefix="/messages", tags=["Messages"])
api_router.include_router(chat.router, prefix="/chat", tags=["AI Chat & Streaming"])
api_router.include_router(documents.router, prefix="/documents", tags=["Document Intelligence"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["Task Management"])
api_router.include_router(tools.router, prefix="/tools", tags=["AI Tools"])
api_router.include_router(voice.router, prefix="/voice", tags=["Voice Assistant"])
