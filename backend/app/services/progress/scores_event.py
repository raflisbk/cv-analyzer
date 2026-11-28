from app.services.progress.stages import build_progress_payload

SCORE_DIMENSIONS = ("overall", "impact", "clarity", "relevance", "completeness")
SCORES_READY_MESSAGE = "Your scores are ready"


def summary_scores(scores: dict | None) -> dict | None:
    if not isinstance(scores, dict) or not scores:
        return None
    return {
        dimension: int(scores.get(dimension) or 0) for dimension in SCORE_DIMENSIONS
    }


def scores_ready_payload(job_id: str, scores: dict | None) -> dict | None:
    summary = summary_scores(scores)
    if summary is None:
        return None
    return build_progress_payload(
        job_id,
        "scores_ready",
        SCORES_READY_MESSAGE,
        extra={"scores": summary},
    )
