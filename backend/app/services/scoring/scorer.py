"""CV scoring orchestrator — delegates to LLM-based scorer.

Previous embedding/anchor approach replaced by llm_scorer.py.
Old files (anchors.py, role_anchors.py, dynamic_anchors.py) kept but unused.
"""

from app.core.logging import structured_logger as logger


def score_cv(
    text: str,
    jd_text: str | None = None,
    target_role: str | None = None,
    nlp_sections: list[dict] | None = None,
) -> dict:
    from app.core.config import get_settings
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
    return score_cv_with_llm(text, target_role=target_role, jd_text=jd_text)
