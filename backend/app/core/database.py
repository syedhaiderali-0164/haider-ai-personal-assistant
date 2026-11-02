from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.core.config import settings

def get_async_database_config(raw_url: str) -> tuple[str, dict]:
    """
    Normalizes database URL and connection arguments for SQLAlchemy async engine.
    - Converts postgres:// and postgresql:// to postgresql+asyncpg://
    - Converts sqlite:// to sqlite+aiosqlite://
    - Converts sslmode=require to ssl=require for asyncpg compatibility
    - Disables prepared statement cache for Neon pooled connections (PgBouncer)
    - Sets check_same_thread=False for SQLite
    """
    if raw_url.startswith("postgres://"):
        db_url = raw_url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif raw_url.startswith("postgresql://") and not raw_url.startswith("postgresql+"):
        db_url = raw_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    elif raw_url.startswith("sqlite://") and not raw_url.startswith("sqlite+"):
        db_url = raw_url.replace("sqlite://", "sqlite+aiosqlite://", 1)
    else:
        db_url = raw_url

    # For asyncpg, query parameter sslmode=... must be ssl=...
    if "sslmode=" in db_url:
        db_url = db_url.replace("sslmode=", "ssl=")

    connect_args: dict = {}
    if "sqlite" in db_url:
        connect_args["check_same_thread"] = False
    elif "-pooler" in db_url or "neon.tech" in db_url:
        # Disable prepared statement caching for Neon PgBouncer transaction pooler
        connect_args["statement_cache_size"] = 0

    return db_url, connect_args

database_url, connect_args = get_async_database_config(settings.DATABASE_URL)

async_engine = create_async_engine(
    database_url,
    echo=False,
    future=True,
    connect_args=connect_args
)

AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

Base = declarative_base()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

async def init_db():
    """
    Initializes database schema.
    - Development mode: automatically runs Base.metadata.create_all for local SQLite development.
    - Production mode: skips automatic create_all; schema is managed via Alembic migrations.
    """
    if settings.ENVIRONMENT.lower() == "development":
        async with async_engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

