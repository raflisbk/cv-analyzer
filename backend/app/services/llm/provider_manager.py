from collections import defaultdict
from dataclasses import dataclass
from enum import Enum
from threading import Lock

from app.core.logging import structured_logger as logger


class ProviderType(str, Enum):

    OPENAI = "openai"
    ZAI = "zai"


@dataclass
class ProviderStats:

    consecutive_failures: int = 0
    last_failure_time: float | None = None
    total_failures: int = 0
    total_successes: int = 0


class ProviderManager:

    _instance: "ProviderManager | None" = None
    _lock = Lock()

    def __new__(cls) -> "ProviderManager":
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self) -> None:
        if not hasattr(self, "_initialized"):
            self._stats: dict[ProviderType, ProviderStats] = defaultdict(
                lambda: ProviderStats()
            )
            self._current_provider: ProviderType = ProviderType.ZAI
            self._failure_threshold: int = 3
            self._initialized = True

    def get_current_provider(self) -> ProviderType:
        return self._current_provider

    def record_success(self, provider: ProviderType) -> None:
        self._stats[provider].consecutive_failures = 0
        self._stats[provider].total_successes += 1

        logger.debug(
            "provider_success",
            provider=provider.value,
            total_successes=self._stats[provider].total_successes,
        )

    def record_failure(self, provider: ProviderType, error: Exception) -> None:
        import time

        stats = self._stats[provider]
        stats.consecutive_failures += 1
        stats.total_failures += 1
        stats.last_failure_time = time.time()

        logger.warning(
            "provider_failure",
            provider=provider.value,
            consecutive_failures=stats.consecutive_failures,
            error_type=type(error).__name__,
            error_message=str(error),
        )

        if (
            provider == ProviderType.OPENAI
            and stats.consecutive_failures >= self._failure_threshold
        ):
            self._switch_to_fallback()

    def _switch_to_fallback(self) -> None:
        if self._current_provider == ProviderType.OPENAI:
            self._current_provider = ProviderType.ZAI
            logger.warning(
                "provider_fallback",
                previous_provider=ProviderType.OPENAI.value,
                new_provider=ProviderType.ZAI.value,
                openai_consecutive_failures=self._stats[
                    ProviderType.OPENAI
                ].consecutive_failures,
            )

    def reset(self) -> None:
        self._current_provider = ProviderType.OPENAI
        for provider in self._stats:
            self._stats[provider] = ProviderStats()

        logger.info("provider_reset")

    def get_stats(self) -> dict[str, dict]:
        return {
            provider.value: {
                "consecutive_failures": stats.consecutive_failures,
                "total_failures": stats.total_failures,
                "total_successes": stats.total_successes,
                "last_failure_time": stats.last_failure_time,
            }
            for provider, stats in self._stats.items()
        }


_global_provider_manager: ProviderManager | None = None


def get_provider_manager() -> ProviderManager:
    global _global_provider_manager
    if _global_provider_manager is None:
        _global_provider_manager = ProviderManager()
    return _global_provider_manager
