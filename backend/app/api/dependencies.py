"""Shared API dependencies"""

from app.core.config import Settings, get_settings
from app.db.session import AsyncSession, get_db


# Dependency injection helpers
def get_current_settings() -> Settings:
    return get_settings()
