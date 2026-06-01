from app.core.logging import structured_logger as logger
from app.services.scoring.anchors import (
    CLARITY_ANCHORS,
    COMPLETENESS_ANCHORS,
    IMPACT_ANCHORS,
    RELEVANCE_ANCHORS,
)
from app.services.scoring.embeddings import score_dimension

_DIMENSION_WEIGHTS: dict[str, float] = {
    "clarity": 0.40,
    "impact": 0.25,
    "completeness": 0.20,
    "relevance": 0.15,
}


def score_cv(text: str) -> dict:
    from app.core.config import get_settings

    settings = get_settings()

    if not settings.CV_ANALYZER_KOBOI_API_KEY:
        raise ValueError(
            "CV_ANALYZER_KOBOI_API_KEY not configured. Please set it in your .env file."
        )

    logger.info("scoring_start", text_length=len(text))

    clarity = score_dimension(text, CLARITY_ANCHORS)
    impact = score_dimension(text, IMPACT_ANCHORS)
    completeness = score_dimension(text, COMPLETENESS_ANCHORS)
    relevance = score_dimension(text, RELEVANCE_ANCHORS)

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
        "provider": "koboi",
    }

    logger.info("scoring_done", scores=scores)

    return scores
