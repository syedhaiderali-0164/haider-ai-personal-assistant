from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from backend.app.core.database import get_db
from backend.app.core.security import verify_password, get_password_hash
from backend.app.models.user import User
from backend.app.models.conversation import Conversation
from backend.app.models.message import Message
from backend.app.models.document import Document
from backend.app.models.task import Task
from backend.app.schemas.user import UserOut, UserUpdate, UserPasswordUpdate
from backend.app.api.deps import get_current_user

router = APIRouter()

@router.put("/me", response_model=UserOut)
async def update_profile(
    user_update: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if user_update.email and user_update.email.lower() != current_user.email:
        # Check if email is already taken
        stmt = select(User).where(User.email == user_update.email.lower())
        res = await db.execute(stmt)
        if res.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email is already registered.")
        current_user.email = user_update.email.lower()
        
    if user_update.full_name:
        current_user.full_name = user_update.full_name.strip()
        
    await db.commit()
    await db.refresh(current_user)
    return current_user

@router.put("/me/password")
async def change_password(
    password_data: UserPasswordUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password does not match.")
        
    current_user.hashed_password = get_password_hash(password_data.new_password)
    await db.commit()
    return {"message": "Password updated successfully."}

@router.get("/me/stats")
async def get_user_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Conversations count
    c_stmt = select(func.count(Conversation.id)).where(Conversation.user_id == current_user.id)
    c_count = (await db.execute(c_stmt)).scalar() or 0
    
    # Messages count
    m_stmt = select(func.count(Message.id)).where(Message.user_id == current_user.id)
    m_count = (await db.execute(m_stmt)).scalar() or 0
    
    # Documents count
    d_stmt = select(func.count(Document.id)).where(Document.user_id == current_user.id)
    d_count = (await db.execute(d_stmt)).scalar() or 0
    
    # Tasks count
    t_stmt = select(func.count(Task.id)).where(Task.user_id == current_user.id)
    t_count = (await db.execute(t_stmt)).scalar() or 0
    
    # Completed tasks
    tc_stmt = select(func.count(Task.id)).where(
        Task.user_id == current_user.id,
        Task.status == "completed"
    )
    tc_count = (await db.execute(tc_stmt)).scalar() or 0
    
    return {
        "total_conversations": c_count,
        "total_messages": m_count,
        "total_documents": d_count,
        "total_tasks": t_count,
        "completed_tasks": tc_count
    }
