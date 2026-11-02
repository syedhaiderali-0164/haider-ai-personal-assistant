import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "HAIDER AI"
    PROJECT_SUBTITLE: str = "Your Intelligent Personal AI Assistant"
    DEVELOPER_NAME: str = "Syed Haider Ali"
    DEVELOPER_GITHUB: str = "https://github.com/syedhaiderali-0164"
    DEVELOPER_LINKEDIN: str = "https://www.linkedin.com/in/haider-ali-1447bb3a/"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    
    # Security
    SECRET_KEY: str = "haider_ai_super_secret_jwt_key_change_in_production_2026_x89f72"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    ALGORITHM: str = "HS256"
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./haider_ai.db"
    SYNC_DATABASE_URL: str = "sqlite:///./haider_ai.db"
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]
    
    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v = v.strip()
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    parsed = json.loads(v)
                    if isinstance(parsed, list):
                        return [str(i).strip().rstrip("/") for i in parsed if str(i).strip()]
                except Exception:
                    pass
            return [i.strip().rstrip("/") for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, tuple)):
            return [str(i).strip().rstrip("/") for i in v if str(i).strip()]
        return []
    
    # File Storage
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
    MAX_UPLOAD_SIZE_MB: int = 25
    
    # Default AI Settings
    DEFAULT_AI_PROVIDER: str = "openai"
    DEFAULT_AI_BASE_URL: str = "https://api.openai.com/v1"
    DEFAULT_AI_MODEL: str = "gpt-4o-mini"
    DEFAULT_AI_API_KEY: str = ""
    
    model_config = {
        "case_sensitive": True,
        "env_file": ".env",
        "extra": "allow"
    }

settings = Settings()
