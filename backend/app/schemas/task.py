from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    priority: str = Field("medium", description="low, medium, high, urgent")
    status: str = Field("todo", description="todo, in_progress, completed")
    due_date: Optional[datetime] = None
    tags: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    due_date: Optional[datetime] = None
    tags: Optional[str] = None

class TaskOut(TaskBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TaskStatsOut(BaseModel):
    total: int
    completed: int
    in_progress: int
    todo: int
    urgent: int
    high: int
