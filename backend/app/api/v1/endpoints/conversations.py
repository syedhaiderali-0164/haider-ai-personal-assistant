from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import desc, func

from app.core.database import get_db
from app.models.user import User
from app.models.conversation import Conversation
from app.models.message import Message
from app.schemas.conversation import ConversationCreate, ConversationUpdate, ConversationOut, ConversationDetailOut
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[ConversationOut])
async def list_conversations(
    q: Optional[str] = Query(None, description="Search term for title"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Conversation).where(Conversation.user_id == current_user.id)
    if q:
        query = query.where(Conversation.title.ilike(f"%{q}%"))
        
    query = query.order_by(desc(Conversation.is_pinned), desc(Conversation.updated_at))
    result = await db.execute(query)
    conversations = result.scalars().all()
    
    out = []
    for c in conversations:
        # Get count and last message
        m_count_stmt = select(func.count(Message.id)).where(Message.conversation_id == c.id)
        m_count = (await db.execute(m_count_stmt)).scalar() or 0
        
        last_m_stmt = select(Message.content).where(Message.conversation_id == c.id).order_by(desc(Message.created_at)).limit(1)
        last_m = (await db.execute(last_m_stmt)).scalar_one_or_none()
        
        c_dict = {
            "id": c.id,
            "user_id": c.user_id,
            "title": c.title,
            "model": c.model,
            "is_pinned": c.is_pinned,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
            "message_count": m_count,
            "last_message": (last_m[:80] + "...") if last_m and len(last_m) > 80 else last_m
        }
        out.append(ConversationOut(**c_dict))
        
    return out

@router.post("/", response_model=ConversationDetailOut, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    conv_in: ConversationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_conv = Conversation(
        user_id=current_user.id,
        title=conv_in.title or "New Conversation",
        model=conv_in.model or "gpt-4o-mini"
    )
    db.add(new_conv)
    await db.commit()
    await db.refresh(new_conv)
    
    return ConversationDetailOut(
        id=new_conv.id,
        user_id=new_conv.user_id,
        title=new_conv.title,
        model=new_conv.model,
        is_pinned=new_conv.is_pinned,
        created_at=new_conv.created_at,
        updated_at=new_conv.updated_at,
        message_count=0,
        last_message=None,
        messages=[]
    )

@router.get("/{conversation_id}", response_model=ConversationDetailOut)
async def get_conversation(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = (
        select(Conversation)
        .where(Conversation.id == conversation_id, Conversation.user_id == current_user.id)
        .options(selectinload(Conversation.messages))
    )
    result = await db.execute(stmt)
    conv = result.scalar_one_or_none()
    
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    return ConversationDetailOut(
        id=conv.id,
        user_id=conv.user_id,
        title=conv.title,
        model=conv.model,
        is_pinned=conv.is_pinned,
        created_at=conv.created_at,
        updated_at=conv.updated_at,
        message_count=len(conv.messages),
        last_message=conv.messages[-1].content if conv.messages else None,
        messages=conv.messages
    )

@router.put("/{conversation_id}", response_model=ConversationOut)
async def update_conversation(
    conversation_id: str,
    conv_in: ConversationUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Conversation).where(Conversation.id == conversation_id, Conversation.user_id == current_user.id)
    result = await db.execute(stmt)
    conv = result.scalar_one_or_none()
    
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    if conv_in.title is not None:
        conv.title = conv_in.title.strip()
    if conv_in.is_pinned is not None:
        conv.is_pinned = conv_in.is_pinned
        
    conv.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(conv)
    
    return ConversationOut(
        id=conv.id,
        user_id=conv.user_id,
        title=conv.title,
        model=conv.model,
        is_pinned=conv.is_pinned,
        created_at=conv.created_at,
        updated_at=conv.updated_at
    )

@router.delete("/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Conversation).where(Conversation.id == conversation_id, Conversation.user_id == current_user.id)
    result = await db.execute(stmt)
    conv = result.scalar_one_or_none()
    
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
        
    await db.delete(conv)
    await db.commit()
    return {"message": "Conversation deleted successfully."}

