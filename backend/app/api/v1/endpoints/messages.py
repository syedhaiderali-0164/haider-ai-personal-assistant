from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.app.core.database import get_db
from backend.app.models.user import User
from backend.app.models.message import Message
from backend.app.models.conversation import Conversation
from backend.app.schemas.message import MessageEditRequest, MessageOut
from backend.app.api.deps import get_current_user

router = APIRouter()

@router.put("/{message_id}", response_model=MessageOut)
async def edit_message(
    message_id: str,
    edit_req: MessageEditRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Message).where(Message.id == message_id, Message.user_id == current_user.id)
    result = await db.execute(stmt)
    msg = result.scalar_one_or_none()
    
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
        
    msg.content = edit_req.content.strip()
    await db.commit()
    await db.refresh(msg)
    return msg

@router.delete("/{message_id}")
async def delete_message(
    message_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Message).where(Message.id == message_id, Message.user_id == current_user.id)
    result = await db.execute(stmt)
    msg = result.scalar_one_or_none()
    
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
        
    await db.delete(msg)
    await db.commit()
    return {"message": "Message deleted successfully."}
