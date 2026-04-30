"""
Provider status monitoring endpoints.
Track OpenAI/Z AI fallback status, failure counts, and current provider.
"""

from fastapi import APIRouter
from pydantic import BaseModel

from app.core.logging import structured_logger as logger
from app.services.llm.provider_manager import get_provider_manager


router = APIRouter()


class ProviderStatusResponse(BaseModel):
    """Response model for provider status endpoint"""

    current_provider: str
    failure_threshold: int
    providers: dict[str, dict]


@router.get("/status", response_model=ProviderStatusResponse)
async def get_provider_status() -> ProviderStatusResponse:
    """
    Get current provider status and statistics.

    Returns:
        ProviderStatusResponse with:
        - current_provider: "openai" or "zai"
        - failure_threshold: Number of consecutive failures before fallback
        - providers: Dict with stats for each provider
    """
    provider_manager = get_provider_manager()
    stats = provider_manager.get_stats()

    return ProviderStatusResponse(
        current_provider=provider_manager.get_current_provider().value,
        failure_threshold=provider_manager._failure_threshold,
        providers=stats,
    )


@router.post("/reset")
async def reset_provider_status() -> dict[str, str]:
    """
    Reset provider manager to OpenAI as primary.

    Useful for:
    - Testing fallback behavior
    - Manual recovery after API key updates
    - Health check recovery

    Returns:
        Dict with status message
    """
    provider_manager = get_provider_manager()
    provider_manager.reset()

    logger.info("Provider status reset via API endpoint")

    return {"status": "reset", "current_provider": "openai"}
