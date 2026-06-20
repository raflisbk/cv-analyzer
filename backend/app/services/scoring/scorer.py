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

# Section types most informative per scoring dimension
_IMPACT_SECTION_TYPES = {"experience", "projects", "achievements", "awards"}
_RELEVANCE_SECTION_TYPES = {"skills", "experience", "projects"}

# Top-K anchors to average per dimension (avoids dilution from weakly-matching anchors)
_TOP_K_ANCHORS = 2


def _get_dimension_configs(target_role: str | None) -> list[tuple[str, list[str], float]]:
    if not target_role:
        return _GENERIC_DIMENSION_CONFIGS
    if target_role in ROLE_ANCHORS:
        role = ROLE_ANCHORS[target_role]
        return [
            (dim_name, role.get(dim_name) or _GENERIC_ANCHORS[dim_name], weight)
            for dim_name, _, weight in _GENERIC_DIMENSION_CONFIGS
        ]
    # Unknown / custom role: try LLM-generated anchors (cached in Redis 7 days)
    try:
        from app.services.scoring.dynamic_anchors import get_all_dynamic_anchors

        dynamic = get_all_dynamic_anchors(target_role)
        if dynamic:
            logger.info("dynamic_anchors_applied", role=target_role)
            return [
                (dim_name, dynamic.get(dim_name) or _GENERIC_ANCHORS[dim_name], weight)
                for dim_name, _, weight in _GENERIC_DIMENSION_CONFIGS
            ]
    except Exception as e:
        logger.warning("dynamic_anchors_failed", role=target_role, error=str(e))
    return _GENERIC_DIMENSION_CONFIGS


def _build_focused_text(
    full_text: str, nlp_sections: list[dict] | None, target_types: set[str]
) -> str:
    """Extract text from specific section types; falls back to full text if unavailable."""
    if not nlp_sections:
        return full_text[:3500]
    relevant = [s.get("text", "") for s in nlp_sections if s.get("type", "other") in target_types]
    if not relevant:
        return full_text[:3500]
    return "\n\n".join(relevant)[:3500]


def _top_k_mean_sim(similarities: list[float], k: int = _TOP_K_ANCHORS) -> float:
    """Return mean of the top-k highest similarities (reduces dilution from weak anchors)."""
    if not similarities:
        return 0.0
    top = sorted(similarities, reverse=True)[:k]
    return sum(top) / len(top)


def score_cv(
    text: str,
    jd_text: str | None = None,
    target_role: str | None = None,
    nlp_sections: list[dict] | None = None,
) -> dict:
    from app.core.config import get_settings

    settings = get_settings()

    if not settings.CV_ANALYZER_KOBOI_API_KEY:
        raise ValueError(
            "CV_ANALYZER_KOBOI_API_KEY not configured. Please set it in your .env file."
        )

    dimension_configs = _get_dimension_configs(target_role)

    full_text_slice = text[:3500]
    impact_text = _build_focused_text(text, nlp_sections, _IMPACT_SECTION_TYPES)
    relevance_text = _build_focused_text(text, nlp_sections, _RELEVANCE_SECTION_TYPES)

    # Batch: [full_text, impact_focused, relevance_focused, *all_anchors, jd_text?]
    # Indices 0-2 are the three CV representations; anchors start at index 3.
    all_texts = [full_text_slice, impact_text, relevance_text]
    for _, anchors, _ in dimension_configs:
        all_texts.extend(anchors)
    if jd_text:
        all_texts.append(jd_text[:4000])

    logger.info(
        "scoring_start",
        text_length=len(text),
        total_embeddings=len(all_texts),
        jd_provided=bool(jd_text),
        target_role=target_role,
        has_sections=bool(nlp_sections),
    )

    all_embeddings = get_embeddings(all_texts)

    cv_full_emb = all_embeddings[0]
    cv_impact_emb = all_embeddings[1]
    cv_relevance_emb = all_embeddings[2]
    jd_embedding = all_embeddings[-1] if jd_text else None

    _CV_EMB_FOR_DIM = {
        "clarity": cv_full_emb,
        "impact": cv_impact_emb,
        "completeness": cv_full_emb,
        "relevance": cv_relevance_emb,
    }

    offset = 3  # anchors start after the 3 CV embeddings
    dimension_scores: dict[str, int] = {}

    for dim_name, anchors, _ in dimension_configs:
        anchor_embeddings = all_embeddings[offset : offset + len(anchors)]
        offset += len(anchors)

        if dim_name == "relevance" and jd_embedding is not None:
            # JD provided: direct CV↔JD cosine is more accurate than anchor comparison
            score = max(0, min(100, int(cosine_similarity(cv_full_emb, jd_embedding) * 100)))
            logger.info("dimension_scored", dimension=dim_name, score=score, method="jd_similarity")
        else:
            cv_emb = _CV_EMB_FOR_DIM.get(dim_name, cv_full_emb)
            similarities = [cosine_similarity(cv_emb, ae) for ae in anchor_embeddings]
            mean_sim = _top_k_mean_sim(similarities)
            score = max(0, min(100, int(mean_sim * 100)))
            logger.info(
                "dimension_scored",
                dimension=dim_name,
                score=score,
                method="anchor_topk",
                top_sim=round(max(similarities, default=0), 4),
                mean_sim=round(mean_sim, 4),
            )

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
