from fastapi import APIRouter
from pydantic import BaseModel

from app.core.logging import structured_logger as logger
from app.services.llm.provider_manager import get_provider_manager


router = APIRouter()


class ProviderStatusResponse(BaseModel):

    current_provider: str
    failure_threshold: int
    providers: dict[str, dict]


@router.get("/status", response_model=ProviderStatusResponse)
async def get_provider_status() -> ProviderStatusResponse:
    provider_manager = get_provider_manager()
    stats = provider_manager.get_stats()

    return ProviderStatusResponse(
        current_provider=provider_manager.get_current_provider().value,
        failure_threshold=provider_manager._failure_threshold,
        providers=stats,
    )


@router.post("/reset")
async def reset_provider_status() -> dict[str, str]:
    provider_manager = get_provider_manager()
    provider_manager.reset()

    logger.info("provider_status_reset")

    return {"status": "reset", "current_provider": "openai"}
