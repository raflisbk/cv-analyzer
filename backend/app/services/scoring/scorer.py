"""
CV scoring orchestrator per D-07, SCORE-01..05.
Computes 4 dimension scores + overall using OpenAI cosine similarity.
"""

from app.core.logging import structured_logger as logger
from app.services.scoring.anchors import (
    CLARITY_ANCHORS,
    COMPLETENESS_ANCHORS,
    IMPACT_ANCHORS,
    RELEVANCE_ANCHORS,
)
from app.services.scoring.embeddings import score_dimension


# Dimension weights for overall score calculation (agent's discretion)
# Clarity (40%) + Impact (25%) + Completeness (20%) + Relevance (15%) = 100%
_DIMENSION_WEIGHTS: dict[str, float] = {
    "clarity": 0.40,
    "impact": 0.25,
    "completeness": 0.20,
    "relevance": 0.15,
}


def score_cv(text: str) -> dict:
    """
    Score a CV across 4 dimensions using OpenAI text-embedding-3-small per D-07.

    Each dimension computes cosine similarity between CV text and 4 ideal anchor
    templates (D-08). Scores are integers 0-100. Overall is a weighted average.

    Args:
        text: Full CV text (from job.result['text'])

    Returns:
        Dict with keys: overall, clarity, impact, completeness, relevance (all int 0-100)

    Raises:
        Exception: Propagated from get_embedding() after 3 retries exhausted (D-10).
                   Celery task (Wave 4) catches this and marks job as failed.
    """
    logger.info("Scoring CV", extra={"text_length": len(text)})

    clarity = score_dimension(text, CLARITY_ANCHORS)
    logger.debug("Clarity score computed", extra={"score": clarity})

    impact = score_dimension(text, IMPACT_ANCHORS)
    logger.debug("Impact score computed", extra={"score": impact})

    completeness = score_dimension(text, COMPLETENESS_ANCHORS)
    logger.debug("Completeness score computed", extra={"score": completeness})

    relevance = score_dimension(text, RELEVANCE_ANCHORS)
    logger.debug("Relevance score computed", extra={"score": relevance})

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
    }

    logger.info("CV scoring complete", extra={"scores": scores})
    return scores
