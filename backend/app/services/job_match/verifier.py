import re

from app.schemas.job_match import ExtractedRequirement, MatchRequirement

MISSING_EVIDENCE = "Not found in your CV"
MAX_EVIDENCE_CHARS = 120
WINDOW_WORDS = 8


def _find_quote(quote: str, cv_text: str) -> str | None:
    words = quote.split()
    if not words:
        return None
    windows = [words]
    if len(words) > WINDOW_WORDS:
        windows.extend(
            words[start : start + WINDOW_WORDS]
            for start in range(len(words) - WINDOW_WORDS + 1)
        )
    for window in windows:
        pattern = r"\s+".join(re.escape(word) for word in window)
        match = re.search(pattern, cv_text, flags=re.IGNORECASE)
        if match:
            return match.group(0)[:MAX_EVIDENCE_CHARS]
    return None


def verify_requirement(
    requirement: ExtractedRequirement, cv_text: str
) -> MatchRequirement:
    evidence = _find_quote(requirement.evidence_quote, cv_text)
    status = requirement.status if evidence else "missing"
    return MatchRequirement(
        label=requirement.label,
        weight=requirement.weight,
        category=requirement.category,
        status=status,
        evidence=evidence if status != "missing" else MISSING_EVIDENCE,
    )
