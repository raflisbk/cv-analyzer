"""Deterministic CV metrics — computed without LLM, fully reproducible.

These metrics provide an objective quality baseline that complements
the LLM subjective score. The same CV always produces the same numbers.
"""

import re
from collections import Counter

# ---------------------------------------------------------------------------
# Verb lists (from ats/checker.py — shared ground truth)
# ---------------------------------------------------------------------------

_STRONG_VERBS: set[str] = {
    "accelerated", "achieved", "architected", "automated", "boosted",
    "built", "championed", "conceptualized", "created", "decreased",
    "delivered", "deployed", "designed", "developed", "directed",
    "doubled", "drove", "eliminated", "engineered", "enhanced",
    "established", "exceeded", "executed", "expanded", "founded",
    "generated", "grew", "implemented", "improved", "increased",
    "initiated", "innovated", "integrated", "launched", "led",
    "leveraged", "managed", "maximized", "mentored", "minimized",
    "modernized", "negotiated", "optimized", "orchestrated", "outperformed",
    "overhauled", "pioneered", "produced", "refactored", "reduced",
    "restructured", "revamped", "scaled", "secured", "shaped",
    "shipped", "simplified", "spearheaded", "standardized", "streamlined",
    "transformed", "upgraded", "won",
    # Indonesian
    "membangun", "mengembangkan", "meningkatkan", "mengoptimalkan",
    "memimpin", "merancang", "menciptakan", "mengimplementasikan",
}

_WEAK_VERBS: set[str] = {
    "helped", "assisted", "supported", "worked", "participated",
    "involved", "contributed", "responsible", "tasked", "handled",
    "provided",
}

_PASSIVE_PATTERN = re.compile(
    r"\b(?:was|were|been|is|are|being)\s+\w+(?:ed|en)\b", re.IGNORECASE
)
_BULLET_PATTERN = re.compile(r"^[\s]*[-•●◆▪▸►*]\s+(.+)$", re.MULTILINE)
_NUMBER_IN_TEXT = re.compile(r"\d+(?:[.,]\d+)?(?:\s*[%xX×])?|\$[\d,]+|Rp[\s\d,.]+")
_DATE_RANGE = re.compile(
    r"(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|"
    r"april|june|july|august|september|october|november|december)"
    r"\s+(\d{4})\s*[-–—]\s*"
    r"(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|"
    r"april|june|july|august|september|october|november|december"
    r"|\d{4}|present|current|now|sekarang)",
    re.IGNORECASE,
)
_YEAR_RANGE = re.compile(r"(\d{4})\s*[-–—]\s*(\d{4}|present|current|now|sekarang)", re.IGNORECASE)
_LINKEDIN = re.compile(r"linkedin\.com/in/", re.IGNORECASE)
_GITHUB = re.compile(r"github\.com/", re.IGNORECASE)
_PORTFOLIO = re.compile(r"https?://(?!github|linkedin)[\w.-]+\.[a-z]{2,}", re.IGNORECASE)

_EXPECTED_SECTIONS = {"experience", "education", "skills", "summary", "contact", "projects"}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _extract_bullets(text: str) -> list[str]:
    return [m.group(1).strip() for m in _BULLET_PATTERN.finditer(text)]


def _quantification_ratio(bullets: list[str]) -> float:
    if not bullets:
        return 0.0
    with_numbers = sum(1 for b in bullets if _NUMBER_IN_TEXT.search(b))
    return round(with_numbers / len(bullets), 3)


def _action_verb_ratio(bullets: list[str]) -> dict:
    """Returns ratio of bullets starting with strong vs weak verb."""
    strong = weak = neutral = 0
    for bullet in bullets:
        first_word = bullet.split()[0].lower().rstrip(".,;") if bullet.split() else ""
        if first_word in _STRONG_VERBS:
            strong += 1
        elif first_word in _WEAK_VERBS:
            weak += 1
        else:
            neutral += 1
    total = len(bullets) or 1
    return {
        "strong": strong,
        "weak": weak,
        "neutral": neutral,
        "strong_ratio": round(strong / total, 3),
        "weak_ratio": round(weak / total, 3),
    }


def _passive_voice_ratio(text: str) -> float:
    sentences = [s.strip() for s in re.split(r"[.!?\n]", text) if len(s.strip()) > 10]
    if not sentences:
        return 0.0
    passive = sum(1 for s in sentences if _PASSIVE_PATTERN.search(s))
    return round(passive / len(sentences), 3)


def _avg_bullet_length(bullets: list[str]) -> float:
    if not bullets:
        return 0.0
    return round(sum(len(b.split()) for b in bullets) / len(bullets), 1)


def _section_coverage(nlp_result: dict | None) -> dict:
    if not nlp_result:
        return {"found": [], "missing": list(_EXPECTED_SECTIONS), "score": 0}
    found_types = {s.get("type", "") for s in nlp_result.get("sections", [])}
    found = [s for s in _EXPECTED_SECTIONS if s in found_types]
    missing = [s for s in _EXPECTED_SECTIONS if s not in found_types]
    score = round(len(found) / len(_EXPECTED_SECTIONS) * 100)
    return {"found": found, "missing": missing, "score": score}


def _skill_presence_in_experience(nlp_result: dict | None) -> float:
    """Fraction of top-10 skills that appear verbatim in experience/projects text."""
    if not nlp_result:
        return 0.0
    skills: list[str] = nlp_result.get("skills", [])[:10]
    if not skills:
        return 0.0
    exp_text = " ".join(
        s.get("text", "")
        for s in nlp_result.get("sections", [])
        if s.get("type") in {"experience", "projects"}
    ).lower()
    if not exp_text:
        return 0.0
    present = sum(1 for sk in skills if sk.lower() in exp_text)
    return round(present / len(skills), 3)


def _employment_gaps(text: str) -> dict:
    """Detect employment gaps > 3 months from date ranges in text."""
    import datetime

    _PRESENT_YEAR = datetime.date.today().year

    year_ranges = _YEAR_RANGE.findall(text)
    if len(year_ranges) < 2:
        return {"gaps_found": 0, "longest_gap_months": 0}

    end_years: list[int] = []
    start_years: list[int] = []
    for start, end in year_ranges:
        try:
            s = int(start)
            e = _PRESENT_YEAR if str(end).lower() in {"present", "current", "now", "sekarang"} else int(end)
            start_years.append(s)
            end_years.append(e)
        except ValueError:
            continue

    if not end_years:
        return {"gaps_found": 0, "longest_gap_months": 0}

    # Sort ranges and find gaps
    pairs = sorted(zip(start_years, end_years), key=lambda x: x[0])
    gaps_months: list[int] = []
    for i in range(1, len(pairs)):
        prev_end = pairs[i - 1][1]
        curr_start = pairs[i][0]
        gap = (curr_start - prev_end) * 12
        if gap > 3:
            gaps_months.append(gap)

    return {
        "gaps_found": len(gaps_months),
        "longest_gap_months": max(gaps_months) if gaps_months else 0,
    }


def _contact_signals(text: str) -> dict:
    return {
        "has_email": bool(re.search(r"[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}", text)),
        "has_phone": bool(re.search(r"[\+]?[\d\s\-().]{9,15}", text)),
        "has_linkedin": bool(_LINKEDIN.search(text)),
        "has_github": bool(_GITHUB.search(text)),
        "has_portfolio": bool(_PORTFOLIO.search(text)),
    }


def _objective_score(metrics: dict) -> int:
    """Compute a fully deterministic overall quality score (0–100)."""
    q_ratio     = metrics.get("quantification_ratio", 0)
    verb        = metrics.get("action_verb_ratio", {})
    strong_r    = verb.get("strong_ratio", 0)
    weak_r      = verb.get("weak_ratio", 0)
    passive     = metrics.get("passive_voice_ratio", 0)
    section     = metrics.get("section_coverage", {}).get("score", 0) / 100
    skill_pres  = metrics.get("skill_presence_in_experience", 0)
    contact     = metrics.get("contact_signals", {})
    gap         = metrics.get("employment_gaps", {}).get("longest_gap_months", 0)

    contact_score = sum([
        contact.get("has_email", False),
        contact.get("has_phone", False),
        contact.get("has_linkedin", False),
    ]) / 3

    gap_penalty = min(gap / 24, 0.5)  # max 50% penalty for 2-year gap

    # Weights sum to 100 → raw is already on a 0–100 scale
    raw = (
        q_ratio     * 25 +
        strong_r    * 20 +
        (1 - weak_r) * 10 +
        (1 - passive) * 10 +
        section     * 20 +
        skill_pres  * 10 +
        contact_score * 5
    ) - gap_penalty * 20

    return max(0, min(100, int(raw)))


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def compute_deterministic_metrics(
    cv_text: str,
    nlp_result: dict | None = None,
) -> dict:
    """Return fully reproducible CV quality metrics — no LLM, no randomness."""
    bullets = _extract_bullets(cv_text)

    metrics = {
        "bullet_count": len(bullets),
        "word_count": len(cv_text.split()),
        "quantification_ratio": _quantification_ratio(bullets),
        "action_verb_ratio": _action_verb_ratio(bullets),
        "passive_voice_ratio": _passive_voice_ratio(cv_text),
        "avg_bullet_length_words": _avg_bullet_length(bullets),
        "section_coverage": _section_coverage(nlp_result),
        "skill_presence_in_experience": _skill_presence_in_experience(nlp_result),
        "employment_gaps": _employment_gaps(cv_text),
        "contact_signals": _contact_signals(cv_text),
    }
    metrics["objective_score"] = _objective_score(metrics)
    return metrics
