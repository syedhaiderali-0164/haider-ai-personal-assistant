from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class DocumentOut(BaseModel):
    id: str
    user_id: str
    filename: str
    original_name: str
    file_type: str
    file_size: int
    status: str
    summary: Optional[str] = None
    chunk_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class DocumentQueryRequest(BaseModel):
    document_ids: Optional[List[str]] = None
    query: str
    top_k: Optional[int] = 4

class DocumentQueryResponse(BaseModel):
    answer: str
    relevant_chunks: List[str] = []
    sources: List[str] = []

class DocumentSummaryRequest(BaseModel):
    mode: Optional[str] = "comprehensive"  # executive, key_points, eli5, comprehensive
