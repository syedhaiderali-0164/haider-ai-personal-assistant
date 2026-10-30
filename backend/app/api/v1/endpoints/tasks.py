from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import desc, func

from app.core.database import get_db
from app.models.user import User
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskOut, TaskStatsOut
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=List[TaskOut])
async def list_tasks(
    status_filter: Optional[str] = Query(None, alias="status"),
    priority_filter: Optional[str] = Query(None, alias="priority"),
    search: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = select(Task).where(Task.user_id == current_user.id)
    
    if status_filter and status_filter.lower() != "all":
        query = query.where(Task.status == status_filter.lower())
    if priority_filter and priority_filter.lower() != "all":
        query = query.where(Task.priority == priority_filter.lower())
    if search:
        query = query.where(
            Task.title.ilike(f"%{search}%") | Task.description.ilike(f"%{search}%")
        )
        
    query = query.order_by(desc(Task.created_at))
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_in: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = Task(
        user_id=current_user.id,
        title=task_in.title.strip(),
        description=task_in.description.strip() if task_in.description else None,
        priority=task_in.priority.lower(),
        status=task_in.status.lower(),
        due_date=task_in.due_date,
        tags=task_in.tags
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task

@router.post("/batch", response_model=List[TaskOut], status_code=status.HTTP_201_CREATED)
async def batch_create_tasks(
    tasks_in: List[TaskCreate],
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    created = []
    for item in tasks_in:
        task = Task(
            user_id=current_user.id,
            title=item.title.strip(),
            description=item.description.strip() if item.description else None,
            priority=item.priority.lower(),
            status=item.status.lower(),
            due_date=item.due_date,
            tags=item.tags
        )
        db.add(task)
        created.append(task)
        
    await db.commit()
    for task in created:
        await db.refresh(task)
    return created

@router.get("/stats", response_model=TaskStatsOut)
async def get_task_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    async def count_matching(**filters):
        stmt = select(func.count(Task.id)).where(Task.user_id == current_user.id)
        for k, v in filters.items():
            stmt = stmt.where(getattr(Task, k) == v)
        return (await db.execute(stmt)).scalar() or 0

    total = await count_matching()
    completed = await count_matching(status="completed")
    in_progress = await count_matching(status="in_progress")
    todo = await count_matching(status="todo")
    urgent = await count_matching(priority="urgent")
    high = await count_matching(priority="high")

    return TaskStatsOut(
        total=total,
        completed=completed,
        in_progress=in_progress,
        todo=todo,
        urgent=urgent,
        high=high
    )

@router.put("/{task_id}", response_model=TaskOut)
async def update_task(
    task_id: str,
    task_update: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    result = await db.execute(stmt)
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    if task_update.title is not None:
        task.title = task_update.title.strip()
    if task_update.description is not None:
        task.description = task_update.description.strip()
    if task_update.priority is not None:
        task.priority = task_update.priority.lower()
    if task_update.status is not None:
        task.status = task_update.status.lower()
    if task_update.due_date is not None:
        task.due_date = task_update.due_date
    if task_update.tags is not None:
        task.tags = task_update.tags
        
    task.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(task)
    return task

@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Task).where(Task.id == task_id, Task.user_id == current_user.id)
    result = await db.execute(stmt)
    task = result.scalar_one_or_none()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
        
    await db.delete(task)
    await db.commit()
    return {"message": "Task deleted successfully."}

