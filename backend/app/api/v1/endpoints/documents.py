import os
import uuid
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.models.document import Document, DocumentChunk
from app.models.settings import UserSettings
from app.schemas.document import DocumentOut, DocumentQueryRequest, DocumentQueryResponse, DocumentSummaryRequest
from app.services.rag_service import RAGService
from app.api.deps import get_current_user

router = APIRouter()

ALLOWED_EXTENSIONS = {"pdf", "docx", "doc", "txt", "csv", "xlsx", "xls"}

@router.post("/upload", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check extension
    filename = file.filename or "unknown"
    ext = filename.split(".")[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type .{ext}. Allowed types: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    # Read content & check size limit
    content = await file.read()
    file_size = len(content)
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if file_size > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of {settings.MAX_UPLOAD_SIZE_MB}MB."
        )

    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    unique_filename = f"{uuid.uuid4()}_{filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    with open(file_path, "wb") as f:
        f.write(content)

    # Extract text
    raw_text = RAGService.extract_text(file_path, ext)
    if not raw_text or raw_text.startswith("Error extracting"):
        # Save document with error status
        doc = Document(
            user_id=current_user.id,
            filename=unique_filename,
            original_name=filename,
            file_type=ext,
            file_size=file_size,
            file_path=file_path,
            status="error",
            summary="Could not extract text from document."
        )
        db.add(doc)
        await db.commit()
        await db.refresh(doc)
        return doc

    # Chunk text
    chunks = RAGService.chunk_text(raw_text)

    # Fetch user settings for AI summarization
    st_stmt = select(UserSettings).where(UserSettings.user_id == current_user.id)
    user_settings = (await db.execute(st_stmt)).scalar_one_or_none()

    # Generate initial summary
    initial_summary = await RAGService.generate_document_summary(
        full_text=raw_text,
        mode="executive",
        user_settings=user_settings
    )

    # Create document record
    doc = Document(
        user_id=current_user.id,
        filename=unique_filename,
        original_name=filename,
        file_type=ext,
        file_size=file_size,
        file_path=file_path,
        status="indexed",
        summary=initial_summary,
        chunk_count=len(chunks)
    )
    db.add(doc)
    await db.flush()

    # Save chunks
    for i, chunk_text in enumerate(chunks):
        chunk = DocumentChunk(
            document_id=doc.id,
            user_id=current_user.id,
            chunk_index=i,
            content=chunk_text
        )
        db.add(chunk)

    await db.commit()
    await db.refresh(doc)
    return doc

@router.get("/", response_model=List[DocumentOut])
async def list_documents(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = (
        select(Document)
        .where(Document.user_id == current_user.id)
        .order_by(Document.created_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{document_id}", response_model=DocumentOut)
async def get_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Document).where(Document.id == document_id, Document.user_id == current_user.id)
    result = await db.execute(stmt)
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(Document).where(Document.id == document_id, Document.user_id == current_user.id)
    result = await db.execute(stmt)
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Remove physical file if exists
    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass

    await db.delete(doc)
    await db.commit()
    return {"message": "Document deleted successfully."}

@router.post("/query", response_model=DocumentQueryResponse)
async def query_documents(
    query_req: DocumentQueryRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch user settings
    st_stmt = select(UserSettings).where(UserSettings.user_id == current_user.id)
    user_settings = (await db.execute(st_stmt)).scalar_one_or_none()

    # Query target chunks
    chunk_stmt = select(DocumentChunk).where(DocumentChunk.user_id == current_user.id)
    if query_req.document_ids:
        chunk_stmt = chunk_stmt.where(DocumentChunk.document_id.in_(query_req.document_ids))

    chunk_res = await db.execute(chunk_stmt)
    chunks = chunk_res.scalars().all()

    if not chunks:
        return DocumentQueryResponse(
            answer="No relevant documents were found to query. Please upload a document first.",
            relevant_chunks=[],
            sources=[]
        )

    # Format chunks for similarity ranking
    chunk_data = [
        {"id": c.id, "document_id": c.document_id, "content": c.content}
        for c in chunks
    ]
    top_chunks = RAGService.retrieve_relevant_chunks(
        query=query_req.query,
        chunks=chunk_data,
        top_k=query_req.top_k or 4
    )

    # Get document names for reference
    doc_ids = list({c["document_id"] for c in top_chunks})
    doc_stmt = select(Document.original_name).where(Document.id.in_(doc_ids))
    doc_names = (await db.execute(doc_stmt)).scalars().all()

    chunk_texts = [c["content"] for c in top_chunks]
    answer = await RAGService.answer_question(
        query=query_req.query,
        relevant_chunks=chunk_texts,
        user_settings=user_settings,
        doc_names=list(doc_names)
    )

    return DocumentQueryResponse(
        answer=answer,
        relevant_chunks=chunk_texts,
        sources=list(doc_names)
    )

@router.post("/{document_id}/summary")
async def summarize_document(
    document_id: str,
    summary_req: DocumentSummaryRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = (
        select(Document)
        .where(Document.id == document_id, Document.user_id == current_user.id)
        .options(selectinload(Document.chunks))
    )
    result = await db.execute(stmt)
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    full_text = "\n\n".join([c.content for c in doc.chunks])
    if not full_text:
        full_text = RAGService.extract_text(doc.file_path, doc.file_type)

    st_stmt = select(UserSettings).where(UserSettings.user_id == current_user.id)
    user_settings = (await db.execute(st_stmt)).scalar_one_or_none()

    summary = await RAGService.generate_document_summary(
        full_text=full_text,
        mode=summary_req.mode or "comprehensive",
        user_settings=user_settings
    )

    doc.summary = summary
    await db.commit()
    await db.refresh(doc)
    return {"summary": summary, "mode": summary_req.mode}

