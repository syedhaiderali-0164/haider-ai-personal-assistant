from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.core.database import get_db
from app.core.security import mask_api_key
from app.models.user import User
from app.models.settings import UserSettings
from app.schemas.settings import UserSettingsUpdate, UserSettingsOut, AIConnectionTestRequest, AIConnectionTestResponse
from app.services.ai_service import AIService
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/", response_model=UserSettingsOut)
async def get_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(UserSettings).where(UserSettings.user_id == current_user.id)
    result = await db.execute(stmt)
    user_settings = result.scalar_one_or_none()
    
    if not user_settings:
        user_settings = UserSettings(user_id=current_user.id)
        db.add(user_settings)
        await db.commit()
        await db.refresh(user_settings)
        
    has_key = bool(user_settings.api_key_encrypted)
    masked = mask_api_key(user_settings.api_key_encrypted)
    
    return UserSettingsOut(
        id=user_settings.id,
        user_id=user_settings.user_id,
        api_provider=user_settings.api_provider,
        api_base_url=user_settings.api_base_url,
        model_name=user_settings.model_name,
        temperature=user_settings.temperature,
        max_tokens=user_settings.max_tokens,
        theme=user_settings.theme,
        system_prompt=user_settings.system_prompt,
        voice_speed=user_settings.voice_speed,
        voice_accent=user_settings.voice_accent,
        has_custom_api_key=has_key,
        api_key_masked=masked,
        created_at=user_settings.created_at,
        updated_at=user_settings.updated_at
    )

@router.put("/", response_model=UserSettingsOut)
async def update_settings(
    settings_in: UserSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(UserSettings).where(UserSettings.user_id == current_user.id)
    result = await db.execute(stmt)
    user_settings = result.scalar_one_or_none()
    
    if not user_settings:
        user_settings = UserSettings(user_id=current_user.id)
        db.add(user_settings)
        
    if settings_in.api_provider is not None:
        user_settings.api_provider = settings_in.api_provider
    if settings_in.api_base_url is not None:
        user_settings.api_base_url = settings_in.api_base_url
    if settings_in.model_name is not None:
        user_settings.model_name = settings_in.model_name
    if settings_in.api_key is not None:
        # If empty string was sent, clear it; else update
        user_settings.api_key_encrypted = settings_in.api_key.strip() if settings_in.api_key.strip() else None
    if settings_in.temperature is not None:
        user_settings.temperature = settings_in.temperature
    if settings_in.max_tokens is not None:
        user_settings.max_tokens = settings_in.max_tokens
    if settings_in.theme is not None:
        user_settings.theme = settings_in.theme
    if settings_in.system_prompt is not None:
        user_settings.system_prompt = settings_in.system_prompt
    if settings_in.voice_speed is not None:
        user_settings.voice_speed = settings_in.voice_speed
    if settings_in.voice_accent is not None:
        user_settings.voice_accent = settings_in.voice_accent
        
    await db.commit()
    await db.refresh(user_settings)
    
    return UserSettingsOut(
        id=user_settings.id,
        user_id=user_settings.user_id,
        api_provider=user_settings.api_provider,
        api_base_url=user_settings.api_base_url,
        model_name=user_settings.model_name,
        temperature=user_settings.temperature,
        max_tokens=user_settings.max_tokens,
        theme=user_settings.theme,
        system_prompt=user_settings.system_prompt,
        voice_speed=user_settings.voice_speed,
        voice_accent=user_settings.voice_accent,
        has_custom_api_key=bool(user_settings.api_key_encrypted),
        api_key_masked=mask_api_key(user_settings.api_key_encrypted),
        created_at=user_settings.created_at,
        updated_at=user_settings.updated_at
    )

@router.post("/test-connection", response_model=AIConnectionTestResponse)
async def test_connection(
    test_req: AIConnectionTestRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    stmt = select(UserSettings).where(UserSettings.user_id == current_user.id)
    result = await db.execute(stmt)
    user_settings = result.scalar_one_or_none()
    
    # Use request values or fall back to user's saved settings
    provider = test_req.api_provider or (user_settings.api_provider if user_settings else "openai")
    base_url = test_req.api_base_url or (user_settings.api_base_url if user_settings else "https://api.openai.com/v1")
    model = test_req.model_name or (user_settings.model_name if user_settings else "gpt-4o-mini")
    
    api_key = test_req.api_key
    if not api_key and user_settings:
        api_key = user_settings.api_key_encrypted
        
    res = await AIService.test_connection(
        api_provider=provider,
        api_base_url=base_url,
        model_name=model,
        api_key=api_key
    )
    return AIConnectionTestResponse(**res)

