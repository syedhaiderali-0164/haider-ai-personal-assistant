import json
import time
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db, AsyncSessionLocal
from app.models.user import User
from app.models.settings import UserSettings
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.usage import AIUsageLog
from app.schemas.message import ChatStreamRequest
from app.services.ai_service import AIService
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/stream")
async def chat_stream(
    chat_req: ChatStreamRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Real-time streaming chat endpoint using Server-Sent Events (SSE).
    Saves user message, streams assistant tokens, and saves assistant message on completion.
    """
    user_id = current_user.id
    
    # We will use an independent async session generator inside the streaming lifecycle
    async def sse_event_stream():
        async with AsyncSessionLocal() as db:
            # 1. Fetch user settings
            st_stmt = select(UserSettings).where(UserSettings.user_id == user_id)
            user_settings = (await db.execute(st_stmt)).scalar_one_or_none()
            
            # 2. Get or create conversation
            conv_id = chat_req.conversation_id
            if conv_id:
                conv_stmt = select(Conversation).where(Conversation.id == conv_id, Conversation.user_id == user_id)
                conversation = (await db.execute(conv_stmt)).scalar_one_or_none()
                if not conversation:
                    yield f"data: {json.dumps({'error': 'Conversation not found'})}\n\n"
                    yield "data: [DONE]\n\n"
                    return
            else:
                # Auto title from first 6 words of message
                words = chat_req.message.strip().split()
                title = " ".join(words[:6]) if words else "New Chat"
                if len(words) > 6:
                    title += "..."
                conversation = Conversation(
                    user_id=user_id,
                    title=title,
                    model=chat_req.model or (user_settings.model_name if user_settings else "gpt-4o-mini")
                )
                db.add(conversation)
                await db.commit()
                await db.refresh(conversation)
                conv_id = conversation.id

            # Emit conversation metadata immediately to client
            yield f"data: {json.dumps({'type': 'conversation_info', 'conversation_id': conv_id, 'title': conversation.title})}\n\n"

            # 3. Save user message
            user_msg = Message(
                conversation_id=conv_id,
                user_id=user_id,
                role="user",
                content=chat_req.message.strip(),
                model=conversation.model
            )
            db.add(user_msg)
            conversation.updated_at = datetime.now(timezone.utc)
            await db.commit()
            await db.refresh(user_msg)

            # 4. Fetch last 12 messages for conversation context
            history_stmt = (
                select(Message)
                .where(Message.conversation_id == conv_id)
                .order_by(Message.created_at.asc())
            )
            history_res = await db.execute(history_stmt)
            messages = history_res.scalars().all()
            
            context_messages = [
                {"role": m.role, "content": m.content}
                for m in messages[-12:]
            ]

            # 5. Stream from AI Service
            full_response = []
            start_time = time.time()
            effective_model = chat_req.model or conversation.model
            
            async for sse_chunk in AIService.stream_response(
                messages=context_messages,
                user_settings=user_settings,
                override_model=effective_model,
                override_temp=chat_req.temperature,
                system_prompt=chat_req.system_prompt
            ):
                if sse_chunk.startswith("data: "):
                    body = sse_chunk[6:].strip()
                    if body == "[DONE]":
                        break
                    try:
                        parsed = json.loads(body)
                        if "content" in parsed:
                            full_response.append(parsed["content"])
                        yield sse_chunk
                    except Exception:
                        yield sse_chunk
                else:
                    yield sse_chunk

            assistant_text = "".join(full_response).strip()
            latency = round((time.time() - start_time) * 1000, 2)

            # 6. Save assistant message if non-empty
            if assistant_text:
                asst_msg = Message(
                    conversation_id=conv_id,
                    user_id=user_id,
                    role="assistant",
                    content=assistant_text,
                    tokens_used=len(assistant_text.split()),
                    model=effective_model
                )
                db.add(asst_msg)
                
                # Usage log
                usage_log = AIUsageLog(
                    user_id=user_id,
                    feature="chat",
                    model=effective_model,
                    tokens_in=len(chat_req.message.split()),
                    tokens_out=len(assistant_text.split()),
                    latency_ms=latency,
                    status="success"
                )
                db.add(usage_log)
                conversation.updated_at = datetime.now(timezone.utc)
                await db.commit()
                await db.refresh(asst_msg)
                
                # Final message meta
                yield f"data: {json.dumps({'type': 'message_saved', 'message_id': asst_msg.id, 'conversation_id': conv_id})}\n\n"

            yield "data: [DONE]\n\n"

    return StreamingResponse(
        sse_event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )

