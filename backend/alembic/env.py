import os
import sys
from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context

# Ensure backend directory and workspace root are in sys.path
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
root_dir = os.path.abspath(os.path.join(backend_dir, ".."))
for d in (backend_dir, root_dir):
    if d not in sys.path:
        sys.path.insert(0, d)

from app.core.config import settings
from app.models import Base

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def get_sync_url() -> str:
    # Prefer SYNC_DATABASE_URL if set; otherwise fallback to DATABASE_URL
    if settings.SYNC_DATABASE_URL and (
        not settings.DATABASE_URL.startswith("postgres") or settings.SYNC_DATABASE_URL.startswith("postgres")
    ):
        url = settings.SYNC_DATABASE_URL
    else:
        url = settings.DATABASE_URL or settings.SYNC_DATABASE_URL

    # Explicitly use the installed psycopg2 driver for synchronous PostgreSQL migrations
    if url.startswith("postgresql+asyncpg://"):
        url = url.replace("postgresql+asyncpg://", "postgresql+psycopg2://", 1)
    elif url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+psycopg2://", 1)
    elif url.startswith("postgresql://") and not url.startswith("postgresql+"):
        url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
    elif url.startswith("sqlite+aiosqlite://"):
        url = url.replace("sqlite+aiosqlite://", "sqlite://", 1)

    # Ensure psycopg2 receives standard sslmode parameter
    if "ssl=require" in url and "sslmode=" not in url:
        url = url.replace("ssl=require", "sslmode=require")

    return url

def run_migrations_offline() -> None:
    url = get_sync_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    configuration = config.get_section(config.config_ini_section) or {}
    configuration["sqlalchemy.url"] = get_sync_url()
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
