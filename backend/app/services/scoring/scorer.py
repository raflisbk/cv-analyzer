"""CV scoring orchestrator.

Pipeline:
1. LLM scoring (4 dimensions + reasoning)
2. Deterministic metrics (objective signals)
3. Score adjustments (±10 pt nudge based on deterministic signals)
4. JD keyword gap (when jd_text is provided)
"""

from app.core.logging import structured_logger as logger


def score_cv(
    text: str,
    jd_text: str | None = None,
    target_role: str | None = None,
    nlp_sections: list[dict] | None = None,
    nlp_result: dict | None = None,
) -> dict:
    from app.core.config import get_settings
    from app.services.scoring.deterministic_metrics import (
        apply_score_adjustments,
        compute_deterministic_metrics,
    )
    from app.services.scoring.jd_gap import compute_jd_keyword_gaps
    from app.services.scoring.llm_scorer import score_cv_with_llm

    settings = get_settings()
    if not settings.CV_ANALYZER_KOBOI_API_KEY:
        raise ValueError(
            "CV_ANALYZER_KOBOI_API_KEY not configured. Please set it in your .env file."
        )

    logger.info(
        "scoring_start",
        text_length=len(text),
        target_role=target_role,
        jd_provided=bool(jd_text),
    )

    # Step 1: LLM scoring
    scores = score_cv_with_llm(text, target_role=target_role, jd_text=jd_text)

    # Step 2: Deterministic metrics
    try:
        metrics = compute_deterministic_metrics(text, nlp_result)
        scores["metrics"] = metrics
    except Exception as e:
        logger.warning("deterministic_metrics_failed", error=str(e))
        scores["metrics"] = {}
        metrics = {}

    # Step 3: Score adjustments + consistency guard
    try:
        adjusted_scores, low_confidence = apply_score_adjustments(scores, metrics)
        # Carry over non-score fields from original
        adjusted_scores["metrics"] = metrics
        adjusted_scores["low_confidence"] = low_confidence
        scores = adjusted_scores
    except Exception as e:
        logger.warning("score_adjustment_failed", error=str(e))
        scores["low_confidence"] = False

    # Step 4: JD keyword gap (only when JD is provided)
    if jd_text:
        try:
            cv_skills = (nlp_result or {}).get("skills", [])
            scores["jd_keyword_gap"] = compute_jd_keyword_gaps(jd_text, text, cv_skills)
        except Exception as e:
            logger.warning("jd_gap_failed", error=str(e))

    return scores
