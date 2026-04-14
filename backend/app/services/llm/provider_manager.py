"""
Provider manager for LLM/embedding fallback strategy.
Currently using HF Inference as the primary and only provider.
This module is kept for potential future multi-provider support.
"""

from collections import defaultdict
from dataclasses import dataclass
from enum import Enum
from threading import Lock
from typing import Literal

from app.core.logging import structured_logger as logger


class ProviderType(str, Enum):
    """Available LLM/embedding providers"""

    OPENAI = "openai"
    ZAI = "zai"


@dataclass
class ProviderStats:
    """Track failure statistics for a provider"""

    consecutive_failures: int = 0
    last_failure_time: float | None = None
    total_failures: int = 0
    total_successes: int = 0


class ProviderManager:
    """
    Manages provider selection with fallback strategy.

    Strategy:
    - Primary: HF Inference (Qwen2.5-7B-Instruct)
    - Fallback: None (HF is the only LLM provider)
    - HF Inference: Used for all LLM + embeddings (scoring, RAG, suggestions)
    - Reset: Successful call resets consecutive failure counter
    - All error types count as failures (timeout, 500, etc.)
    """

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
            self._current_provider: ProviderType = ProviderType.ZAI  # Z AI as primary
            self._failure_threshold: int = 3
            self._initialized = True

    def get_current_provider(self) -> ProviderType:
        """
        Get the current active provider.

        Returns:
            ProviderType: Current provider to use
        """
        return self._current_provider

    def record_success(self, provider: ProviderType) -> None:
        """
        Record a successful API call. Resets consecutive failure counter.

        Args:
            provider: Provider that succeeded
        """
        self._stats[provider].consecutive_failures = 0
        self._stats[provider].total_successes += 1

        logger.debug(
            "Provider success recorded",
            extra={
                "provider": provider.value,
                "total_successes": self._stats[provider].total_successes,
            },
        )

    def record_failure(self, provider: ProviderType, error: Exception) -> None:
        """
        Record a failed API call. Triggers fallback if threshold reached.

        Args:
            provider: Provider that failed
            error: Exception that caused the failure
        """
        import time

        stats = self._stats[provider]
        stats.consecutive_failures += 1
        stats.total_failures += 1
        stats.last_failure_time = time.time()

        logger.warning(
            "Provider failure recorded",
            extra={
                "provider": provider.value,
                "consecutive_failures": stats.consecutive_failures,
                "error_type": type(error).__name__,
                "error_message": str(error),
            },
        )

        # Trigger fallback if this is OpenAI and we've hit threshold
        if (
            provider == ProviderType.OPENAI
            and stats.consecutive_failures >= self._failure_threshold
        ):
            self._switch_to_fallback()

    def _switch_to_fallback(self) -> None:
        """Switch from OpenAI to Z AI after threshold failures."""
        if self._current_provider == ProviderType.OPENAI:
            self._current_provider = ProviderType.ZAI
            logger.warning(
                "Fallback triggered: switching to Z AI",
                extra={
                    "previous_provider": ProviderType.OPENAI.value,
                    "new_provider": ProviderType.ZAI.value,
                    "openai_consecutive_failures": self._stats[
                        ProviderType.OPENAI
                    ].consecutive_failures,
                },
            )

    def reset(self) -> None:
        """
        Reset provider state (mainly for testing). Returns to OpenAI as primary.
        """
        self._current_provider = ProviderType.OPENAI
        for provider in self._stats:
            self._stats[provider] = ProviderStats()

        logger.info("Provider manager reset to OpenAI as primary")

    def get_stats(self) -> dict[str, dict]:
        """
        Get statistics for all providers.

        Returns:
            Dict with provider stats (useful for monitoring/health checks)
        """
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
    """Get global provider manager singleton."""
    global _global_provider_manager
    if _global_provider_manager is None:
        _global_provider_manager = ProviderManager()
    return _global_provider_manager
