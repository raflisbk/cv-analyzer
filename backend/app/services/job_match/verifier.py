import re

from app.schemas.job_match import ExtractedRequirement, MatchRequirement

MISSING_EVIDENCE = "Not found in your CV"
MAX_EVIDENCE_CHARS = 120
WINDOW_WORDS = 8
STOP_WORDS = {"and", "are", "for", "from", "has", "the", "this", "was", "with"}


def _meaningful_tokens(text: str) -> set[str]:
    return {
        token
        for token in re.findall(r"[a-z0-9]+", text.lower())
        if len(token) >= 3 and token not in STOP_WORDS
    }


def _relevant(quote: str, label: str) -> bool:
    if len(quote.split()) >= 3:
        return True
    return any(
        left == right
        or (
            min(len(left), len(right)) >= 5
            and (left.startswith(right) or right.startswith(left))
        )
        for left in _meaningful_tokens(quote)
        for right in _meaningful_tokens(label)
    )


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
    status = (
        requirement.status
        if evidence and _relevant(evidence, requirement.label)
        else "missing"
    )
    return MatchRequirement(
        label=requirement.label,
        weight=requirement.weight,
        category=requirement.category,
        status=status,
        evidence=evidence if status != "missing" else MISSING_EVIDENCE,
    )
