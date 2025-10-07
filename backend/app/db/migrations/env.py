from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context
from app.models.base import Base  # import metadata
from app.core.config import settings

config = context.config
config.set_main_option("sqlalchemy.url", settings.database_uri)  # async URL

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

async def run_migrations_online():
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(context.configure, target_metadata=target_metadata)
        await connection.run_sync(do_run_migrations)

def do_run_migrations(connection: Connection):
    context.run_migrations()

run_migrations = run_migrations_online
