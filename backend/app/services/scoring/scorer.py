from app.core.logging import structured_logger as logger
from app.services.scoring.anchors import (
    CLARITY_ANCHORS,
    COMPLETENESS_ANCHORS,
    IMPACT_ANCHORS,
    RELEVANCE_ANCHORS,
)
from app.services.scoring.embeddings import cosine_similarity, get_embeddings
from app.services.scoring.role_anchors import ROLE_ANCHORS

_GENERIC_DIMENSION_CONFIGS: list[tuple[str, list[str], float]] = [
    ("clarity", CLARITY_ANCHORS, 0.40),
    ("impact", IMPACT_ANCHORS, 0.25),
    ("completeness", COMPLETENESS_ANCHORS, 0.20),
    ("relevance", RELEVANCE_ANCHORS, 0.15),
]

_GENERIC_ANCHORS = {
    "clarity": CLARITY_ANCHORS,
    "impact": IMPACT_ANCHORS,
    "completeness": COMPLETENESS_ANCHORS,
    "relevance": RELEVANCE_ANCHORS,
}


def _get_dimension_configs(target_role: str | None) -> list[tuple[str, list[str], float]]:
    if not target_role or target_role not in ROLE_ANCHORS:
        return _GENERIC_DIMENSION_CONFIGS
    role = ROLE_ANCHORS[target_role]
    weights: list[tuple[str, list[str], float]] = []
    for dim_name, _, weight in _GENERIC_DIMENSION_CONFIGS:
        anchors = role.get(dim_name) or _GENERIC_ANCHORS[dim_name]
        weights.append((dim_name, anchors, weight))
    return weights


def score_cv(text: str, jd_text: str | None = None, target_role: str | None = None) -> dict:
    from app.core.config import get_settings

    settings = get_settings()

    if not settings.CV_ANALYZER_KOBOI_API_KEY:
        raise ValueError(
            "CV_ANALYZER_KOBOI_API_KEY not configured. Please set it in your .env file."
        )

    dimension_configs = _get_dimension_configs(target_role)

    # Build flat list: [cv_text, *all_anchors, jd_text(optional)]
    all_texts = [text]
    for _, anchors, _ in dimension_configs:
        all_texts.extend(anchors)
    if jd_text:
        all_texts.append(jd_text[:4000])

    total = len(all_texts)
    logger.info(
        "scoring_start",
        text_length=len(text),
        total_embeddings=total,
        jd_provided=bool(jd_text),
        target_role=target_role,
    )

    all_embeddings = get_embeddings(all_texts)

    cv_embedding = all_embeddings[0]
    jd_embedding = all_embeddings[-1] if jd_text else None
    offset = 1

    dimension_scores: dict[str, int] = {}
    for dim_name, anchors, _ in dimension_configs:
        anchor_embeddings = all_embeddings[offset : offset + len(anchors)]
        offset += len(anchors)

        if dim_name == "relevance" and jd_embedding is not None:
            # JD provided: use direct CV↔JD similarity as relevance (more accurate)
            score = max(0, min(100, int(cosine_similarity(cv_embedding, jd_embedding) * 100)))
            logger.info("dimension_scored", dimension=dim_name, score=score, method="jd_similarity")
        else:
            similarities = [cosine_similarity(cv_embedding, ae) for ae in anchor_embeddings]
            score = 50 if not similarities else max(0, min(100, int(sum(similarities) / len(similarities) * 100)))
            logger.info("dimension_scored", dimension=dim_name, score=score, method="anchor")

        dimension_scores[dim_name] = score

    overall = min(100, max(0, int(sum(dimension_scores[d] * w for d, _, w in dimension_configs))))

    scores = {
        "overall": overall,
        **dimension_scores,
        "scoring_method": "embedding",
        "provider": "koboi",
        "jd_relevance": bool(jd_text),
        "target_role": target_role,
    }

    logger.info("scoring_done", scores=scores)
    return scores
