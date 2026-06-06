from app.core.logging import structured_logger as logger
from app.services.scoring.anchors import (
    CLARITY_ANCHORS,
    COMPLETENESS_ANCHORS,
    IMPACT_ANCHORS,
    RELEVANCE_ANCHORS,
)
from app.services.scoring.embeddings import cosine_similarity, get_embeddings

_DIMENSION_CONFIGS: list[tuple[str, list[str], float]] = [
    ("clarity", CLARITY_ANCHORS, 0.40),
    ("impact", IMPACT_ANCHORS, 0.25),
    ("completeness", COMPLETENESS_ANCHORS, 0.20),
    ("relevance", RELEVANCE_ANCHORS, 0.15),
]


def score_cv(text: str) -> dict:
    from app.core.config import get_settings

    settings = get_settings()

    if not settings.CV_ANALYZER_KOBOI_API_KEY:
        raise ValueError(
            "CV_ANALYZER_KOBOI_API_KEY not configured. Please set it in your .env file."
        )

    # Build a single flat list: [cv_text, *clarity_anchors, *impact_anchors, ...]
    all_texts = [text]
    for _, anchors, _ in _DIMENSION_CONFIGS:
        all_texts.extend(anchors)

    total = len(all_texts)
    logger.info("scoring_start", text_length=len(text), total_embeddings=total)

    # One HTTP call for all embeddings
    all_embeddings = get_embeddings(all_texts)

    cv_embedding = all_embeddings[0]
    offset = 1

    dimension_scores: dict[str, int] = {}
    for dim_name, anchors, _ in _DIMENSION_CONFIGS:
        anchor_embeddings = all_embeddings[offset : offset + len(anchors)]
        offset += len(anchors)

        similarities = [cosine_similarity(cv_embedding, ae) for ae in anchor_embeddings]

        if not similarities:
            score = 50
        else:
            score = max(0, min(100, int(sum(similarities) / len(similarities) * 100)))

        dimension_scores[dim_name] = score
        logger.info("dimension_scored", dimension=dim_name, score=score)

    overall = int(
        sum(dimension_scores[d] * w for d, _, w in _DIMENSION_CONFIGS)
    )
    overall = min(100, max(0, overall))

    scores = {
        "overall": overall,
        **dimension_scores,
        "scoring_method": "embedding",
        "provider": "koboi",
    }

    logger.info("scoring_done", scores=scores)
    return scores
