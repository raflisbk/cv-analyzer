import re

from app.schemas.job_match import MatchDimension, MatchRequirement
from app.services.scoring.jd_gap import compute_jd_keyword_gaps

WEIGHT_POINTS = {"must": 2, "nice": 1}
STATUS_POINTS = {"met": 1.0, "partial": 0.5, "missing": 0.0}
DIMENSION_KEYS = {
    "skills": "Skills",
    "experience": "Experience",
    "education": "Education",
    "keywords": "Keywords",
    "seniority": "Seniority",
}
SENIORITY_YEARS = {"senior": 5, "lead": 7, "principal": 10, "junior": 0}
YEARS_PATTERN = re.compile(r"\b(\d{1,2})\+?\s+years?\b", re.I)


def weighted_score(requirements: list[MatchRequirement]) -> int:
    total = sum(WEIGHT_POINTS[item.weight] for item in requirements)
    if not total:
        return 0
    earned = sum(
        WEIGHT_POINTS[item.weight] * STATUS_POINTS[item.status] for item in requirements
    )
    return round(100 * earned / total)


def _fallback_dimension(
    key: str, cv_text: str, jd_text: str, nlp_result: dict | None
) -> int | None:
    sections = (nlp_result or {}).get("sections") or []
    education = any(
        section.get("type") == "education"
        and section.get("text")
        and section["text"] in cv_text
        for section in sections
        if isinstance(section, dict)
    )
    if key == "education" and education:
        return 100
    if key == "keywords":
        gaps = compute_jd_keyword_gaps(jd_text, cv_text)
        if gaps["matched_keywords"]:
            return round(100 * gaps["match_ratio"])
    if key == "seniority":
        level = next(
            (name for name in SENIORITY_YEARS if name in jd_text.lower()), None
        )
        years = [int(match) for match in YEARS_PATTERN.findall(cv_text)]
        if level and years:
            return 100 if max(years) >= SENIORITY_YEARS[level] else 0
    return None


def dimensions(
    requirements: list[MatchRequirement],
    cv_text: str,
    jd_text: str,
    nlp_result: dict | None = None,
) -> list[MatchDimension]:
    result = []
    for category, label in DIMENSION_KEYS.items():
        subset = [item for item in requirements if item.category == category]
        score = (
            weighted_score(subset)
            if subset
            else _fallback_dimension(category, cv_text, jd_text, nlp_result)
        )
        if score is not None:
            result.append(MatchDimension(key=label, score=score))
    return result
