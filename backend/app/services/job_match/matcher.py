from app.schemas.job_match import JobMatchData
from app.services.job_match.cache import cache_key, cached_match, store_match
from app.services.job_match.extractor import extract_requirements
from app.services.job_match.scoring import dimensions, weighted_score
from app.services.job_match.verdict import verdict
from app.services.job_match.verifier import verify_requirement


def match_job(
    job_id: str, jd_text: str, cv_text: str, nlp_result: dict | None = None
) -> JobMatchData:
    key = cache_key(job_id, jd_text, cv_text)
    cached = cached_match(key)
    if cached is not None:
        return cached
    extracted = extract_requirements(jd_text, cv_text)
    normalized_jd = " ".join(jd_text.casefold().split())
    requirements = [
        verify_requirement(item, cv_text)
        for item in extracted.requirements
        if " ".join(item.label.casefold().split()) in normalized_jd
    ]
    score = weighted_score(requirements)
    headline, summary = verdict(score, requirements)
    result = JobMatchData(
        score=score,
        headline=headline,
        summary=summary,
        dimensions=dimensions(requirements, cv_text, jd_text, nlp_result),
        requirements=requirements,
    )
    store_match(key, result)
    return result
