from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from backend.app.core.database import get_db
from backend.app.models.user import User
from backend.app.models.settings import UserSettings
from backend.app.models.usage import AIUsageLog
from backend.app.schemas.tools import (
    WritingAssistantRequest,
    SummarizerRequest,
    TranslatorRequest,
    CodingAssistantRequest,
    StudyAssistantRequest,
    ProductivityAssistantRequest,
    ToolExecutionResponse
)
from backend.app.services.ai_service import AIService
from backend.app.api.deps import get_current_user

router = APIRouter()

@router.post("/writing", response_model=ToolExecutionResponse)
async def writing_assistant(
    req: WritingAssistantRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    st_stmt = select(UserSettings).where(UserSettings.user_id == current_user.id)
    user_settings = (await db.execute(st_stmt)).scalar_one_or_none()

    system_prompt = (
        "You are HAIDER AI Writing Assistant, created by Syed Haider Ali. "
        "You craft masterful, polished, engaging, and context-appropriate prose tailored to the requested format and tone."
    )
    user_prompt = (
        f"TASK: Generate a {req.category.replace('_', ' ').title()}\n"
        f"TONE: {req.tone}\n"
        f"TARGET AUDIENCE: {req.audience}\n"
        f"CONTENT / PROMPT: {req.topic_or_content}\n"
    )
    if req.extra_instructions:
        user_prompt += f"ADDITIONAL INSTRUCTIONS: {req.extra_instructions}\n"

    result = await AIService.generate_response(
        messages=[{"role": "user", "content": user_prompt}],
        user_settings=user_settings,
        system_prompt=system_prompt
    )

    # Log usage
    db.add(AIUsageLog(user_id=current_user.id, feature="writing", tokens_out=len(result.split()), status="success"))
    await db.commit()

    return ToolExecutionResponse(feature="writing", result=result, metadata={"category": req.category, "tone": req.tone})

@router.post("/summarizer", response_model=ToolExecutionResponse)
async def summarizer(
    req: SummarizerRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    st_stmt = select(UserSettings).where(UserSettings.user_id == current_user.id)
    user_settings = (await db.execute(st_stmt)).scalar_one_or_none()

    system_prompt = (
        "You are HAIDER AI Summarizer, created by Syed Haider Ali. "
        "You distill complex text into lucid, accurate, and structured summaries without losing critical details."
    )
    user_prompt = (
        f"SUMMARY TYPE: {req.summary_type}\n"
        f"DESIRED LENGTH: {req.length}\n\n"
        f"ORIGINAL CONTENT:\n{req.content}\n\n"
        "Please provide the requested summary:"
    )

    result = await AIService.generate_response(
        messages=[{"role": "user", "content": user_prompt}],
        user_settings=user_settings,
        system_prompt=system_prompt
    )

    db.add(AIUsageLog(user_id=current_user.id, feature="summarizer", tokens_out=len(result.split()), status="success"))
    await db.commit()

    return ToolExecutionResponse(feature="summarizer", result=result, metadata={"type": req.summary_type})

@router.post("/translator", response_model=ToolExecutionResponse)
async def translator(
    req: TranslatorRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    st_stmt = select(UserSettings).where(UserSettings.user_id == current_user.id)
    user_settings = (await db.execute(st_stmt)).scalar_one_or_none()

    system_prompt = (
        "You are HAIDER AI Polyglot Translator, created by Syed Haider Ali. "
        "You provide nuanced, culturally natural, grammatically flawless translations. "
        "Pay special attention when translating to or from Urdu and English, maintaining eloquence, proper idioms, and authentic vocabulary."
    )
    user_prompt = (
        f"SOURCE LANGUAGE: {req.source_language}\n"
        f"TARGET LANGUAGE: {req.target_language}\n"
        f"PRESERVE TONE: {'Yes' if req.preserve_tone else 'No'}\n\n"
        f"TEXT TO TRANSLATE:\n{req.text}\n\n"
        "Provide the exact translation followed by a brief linguistic or cultural nuance note if appropriate."
    )

    result = await AIService.generate_response(
        messages=[{"role": "user", "content": user_prompt}],
        user_settings=user_settings,
        system_prompt=system_prompt
    )

    db.add(AIUsageLog(user_id=current_user.id, feature="translator", tokens_out=len(result.split()), status="success"))
    await db.commit()

    return ToolExecutionResponse(
        feature="translator",
        result=result,
        metadata={"target": req.target_language, "source": req.source_language}
    )

@router.post("/coding", response_model=ToolExecutionResponse)
async def coding_assistant(
    req: CodingAssistantRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    st_stmt = select(UserSettings).where(UserSettings.user_id == current_user.id)
    user_settings = (await db.execute(st_stmt)).scalar_one_or_none()

    system_prompt = (
        "You are HAIDER AI Senior Software Engineer & Coding Assistant, developed by Syed Haider Ali. "
        "You write production-grade, secure, performant, readable, and well-documented code. "
        "When explaining or debugging, clearly pinpoint the root cause and provide complete, corrected code blocks."
    )
    user_prompt = (
        f"ACTION: {req.action.upper()}\n"
        f"LANGUAGE: {req.language}\n"
    )
    if req.error_message:
        user_prompt += f"ERROR MESSAGE / STACK TRACE:\n{req.error_message}\n\n"
    user_prompt += f"CODE / PROMPT:\n{req.code_or_prompt}\n"

    result = await AIService.generate_response(
        messages=[{"role": "user", "content": user_prompt}],
        user_settings=user_settings,
        system_prompt=system_prompt
    )

    db.add(AIUsageLog(user_id=current_user.id, feature="coding", tokens_out=len(result.split()), status="success"))
    await db.commit()

    return ToolExecutionResponse(feature="coding", result=result, metadata={"action": req.action, "language": req.language})

@router.post("/study", response_model=ToolExecutionResponse)
async def study_assistant(
    req: StudyAssistantRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    st_stmt = select(UserSettings).where(UserSettings.user_id == current_user.id)
    user_settings = (await db.execute(st_stmt)).scalar_one_or_none()

    system_prompt = (
        "You are HAIDER AI Academic & Study Mentor, developed by Syed Haider Ali. "
        "You help learners master complex concepts through intuitive analogies, structured study notes, flashcards, and interactive MCQs."
    )
    user_prompt = (
        f"ACTION: {req.action}\n"
        f"TOPIC: {req.topic}\n"
        f"LEVEL: {req.difficulty_level}\n"
        f"QUESTIONS / CARDS COUNT: {req.num_questions}\n\n"
        "Generate a structured, comprehensive response."
    )

    result = await AIService.generate_response(
        messages=[{"role": "user", "content": user_prompt}],
        user_settings=user_settings,
        system_prompt=system_prompt
    )

    db.add(AIUsageLog(user_id=current_user.id, feature="study", tokens_out=len(result.split()), status="success"))
    await db.commit()

    return ToolExecutionResponse(feature="study", result=result, metadata={"action": req.action, "topic": req.topic})

@router.post("/productivity", response_model=ToolExecutionResponse)
async def productivity_assistant(
    req: ProductivityAssistantRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    st_stmt = select(UserSettings).where(UserSettings.user_id == current_user.id)
    user_settings = (await db.execute(st_stmt)).scalar_one_or_none()

    system_prompt = (
        "You are HAIDER AI Executive Productivity & Strategy Coach, developed by Syed Haider Ali. "
        "You break down large goals into prioritized, time-boxed, and actionable task sequences with realistic milestones."
    )
    user_prompt = (
        f"PRODUCTIVITY ACTION: {req.action}\n"
        f"GOALS OR PROJECT: {req.goals_or_project}\n"
        f"AVAILABLE HOURS: {req.available_hours} hours\n"
    )
    if req.deadline:
        user_prompt += f"DEADLINE: {req.deadline}\n"
    user_prompt += "\nPlease provide a clear, structured breakdown with task titles, estimated times, and priorities (Urgent, High, Medium, Low)."

    result = await AIService.generate_response(
        messages=[{"role": "user", "content": user_prompt}],
        user_settings=user_settings,
        system_prompt=system_prompt
    )

    db.add(AIUsageLog(user_id=current_user.id, feature="productivity", tokens_out=len(result.split()), status="success"))
    await db.commit()

    return ToolExecutionResponse(feature="productivity", result=result, metadata={"action": req.action})
