"""
CV scoring orchestrator with AI-only scoring (no rule-based fallback).
Uses OpenAI embeddings with automatic fallback to HF Inference (BGE-M3).
"""

from app.core.logging import structured_logger as logger
from app.services.scoring.anchors import (
    CLARITY_ANCHORS,
    COMPLETENESS_ANCHORS,
    IMPACT_ANCHORS,
    RELEVANCE_ANCHORS,
)
from app.services.scoring.embeddings import score_dimension as openai_score_dimension
from app.services.scoring.hf_embeddings import (
    score_dimension as hf_score_dimension,
)


# Dimension weights for overall score calculation
# Clarity (40%) + Impact (25%) + Completeness (20%) + Relevance (15%) = 100%
_DIMENSION_WEIGHTS: dict[str, float] = {
    "clarity": 0.40,
    "impact": 0.25,
    "completeness": 0.20,
    "relevance": 0.15,
}


def _score_with_openai(text: str) -> dict:
    """
    Score CV using OpenAI embeddings.

    Args:
        text: Full CV text

    Returns:
        Dict with scores and metadata
    """
    logger.info("Scoring CV with OpenAI embeddings", extra={"text_length": len(text)})

    clarity = openai_score_dimension(text, CLARITY_ANCHORS)
    impact = openai_score_dimension(text, IMPACT_ANCHORS)
    completeness = openai_score_dimension(text, COMPLETENESS_ANCHORS)
    relevance = openai_score_dimension(text, RELEVANCE_ANCHORS)

    overall = int(
        clarity * _DIMENSION_WEIGHTS["clarity"]
        + impact * _DIMENSION_WEIGHTS["impact"]
        + completeness * _DIMENSION_WEIGHTS["completeness"]
        + relevance * _DIMENSION_WEIGHTS["relevance"]
    )
    overall = min(100, max(0, overall))

    scores = {
        "overall": overall,
        "clarity": clarity,
        "impact": impact,
        "completeness": completeness,
        "relevance": relevance,
        "scoring_method": "embedding",
        "provider": "openai",
    }

    logger.info("CV scoring complete with OpenAI", extra={"scores": scores})

    return scores


def _score_with_hf(text: str) -> dict:
    """
    Score CV using Hugging Face Inference embeddings (BGE-M3).

    Args:
        text: Full CV text

    Returns:
        Dict with scores and metadata
    """
    logger.info("Scoring CV with HF Inference embeddings", extra={"text_length": len(text)})

    clarity = hf_score_dimension(text, CLARITY_ANCHORS)
    impact = hf_score_dimension(text, IMPACT_ANCHORS)
    completeness = hf_score_dimension(text, COMPLETENESS_ANCHORS)
    relevance = hf_score_dimension(text, RELEVANCE_ANCHORS)

    overall = int(
        clarity * _DIMENSION_WEIGHTS["clarity"]
        + impact * _DIMENSION_WEIGHTS["impact"]
        + completeness * _DIMENSION_WEIGHTS["completeness"]
        + relevance * _DIMENSION_WEIGHTS["relevance"]
    )
    overall = min(100, max(0, overall))

    scores = {
        "overall": overall,
        "clarity": clarity,
        "impact": impact,
        "completeness": completeness,
        "relevance": relevance,
        "scoring_method": "embedding",
        "provider": "hf",
    }

    logger.info("CV scoring complete with HF Inference", extra={"scores": scores})

    return scores


def score_cv(text: str) -> dict:
    """
    Score a CV across 4 dimensions using AI embeddings only.

    Provider Strategy:
    - Primary: OpenAI text-embedding-3-small
    - Fallback: HF Inference BGE-M3 (immediate within same request)
    - No rule-based fallback: always requires working AI API

    Args:
        text: Full CV text (from job.result['text'])

    Returns:
        Dict with keys: overall, clarity, impact, completeness, relevance (all int 0-100),
                        scoring_method, provider

    Raises:
        Exception: If both OpenAI and HF Inference fail
    """
    settings = check_api_keys()

    if not settings["openai"] and not settings["hf"]:
        raise ValueError(
            "No API keys configured. Please set CV_ANALYZER_OPENAI_API_KEY "
            "or CV_ANALYZER_HF_API_KEY in your .env file."
        )

    # Try OpenAI first (if available)
    if settings["openai"]:
        try:
            logger.info("Attempting OpenAI embeddings for scoring")
            return _score_with_openai(text)
        except Exception as e:
            logger.warning(
                "OpenAI embeddings failed, attempting HF Inference fallback",
                extra={"error": str(e)},
            )

            # Try HF fallback (if available)
            if settings["hf"]:
                try:
                    return _score_with_hf(text)
                except Exception as hf_error:
                    logger.error(
                        "Scoring failed with both OpenAI and HF Inference",
                        extra={"openai_error": str(e), "hf_error": str(hf_error)},
                    )
                    raise
            else:
                # HF not configured, re-raise OpenAI error
                logger.error("HF Inference not configured, OpenAI failed", extra={"error": str(e)})
                raise

    # OpenAI not configured, try HF directly
    if settings["hf"]:
        logger.info("OpenAI not configured, using HF Inference directly")
        return _score_with_hf(text)

    # Should not reach here due to earlier check
    raise ValueError("No embedding provider available")


def check_api_keys() -> dict[str, bool]:
    """
    Check which API keys are configured.

    Returns:
        Dict with boolean keys: 'openai', 'hf'
    """
    from app.core.config import get_settings

    settings = get_settings()
    return {
        "openai": bool(settings.CV_ANALYZER_OPENAI_API_KEY),
        "hf": bool(settings.CV_ANALYZER_HF_API_KEY),
    }
