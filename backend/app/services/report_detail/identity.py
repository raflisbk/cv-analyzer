from app.models.job import Job


def role(job: Job) -> str:
    archetype = (job.nlp_result or {}).get("archetype") or {}
    return job.target_role or archetype.get("display_name") or ""


def top_percent(job: Job) -> int:
    percentile = ((job.scores or {}).get("benchmark") or {}).get("percentile")
    return max(1, min(100, 100 - int(percentile))) if percentile is not None else 100
