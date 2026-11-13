import re

from app.models.job import Job
from app.schemas.report_detail import MissingKeyword, PresentKeyword, ReportKeywords


def keywords(job: Job) -> ReportKeywords:
    text = str((job.result or {}).get("text") or "")
    skills = (job.nlp_result or {}).get("skills") or []
    gap = (job.scores or {}).get("jd_keyword_gap") or {}
    missing = (
        gap.get("missing_keywords")
        or (job.comparison_result or {}).get("missing_skills")
        or []
    )
    present = []
    seen = set()
    for skill in skills:
        if not isinstance(skill, str) or skill.lower() in seen:
            continue
        seen.add(skill.lower())
        count = len(re.findall(r"(?<!\w)" + re.escape(skill) + r"(?!\w)", text, re.I))
        if count:
            present.append(PresentKeyword(name=skill, count=count))
    absent = [
        MissingKeyword(name=name, posts=0)
        for name in missing
        if isinstance(name, str) and name.lower() not in seen
    ]
    return ReportKeywords(
        present=present, missing=absent, total=len(present) + len(absent)
    )
