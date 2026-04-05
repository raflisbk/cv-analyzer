"""Shared API dependencies"""

from app.core.config import Settings, get_settings


# Dependency injection helpers
def get_current_settings() -> Settings:
    return get_settings()
