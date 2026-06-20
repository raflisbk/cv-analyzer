"""Deterministic CV metrics — computed without LLM, fully reproducible.

These metrics provide an objective quality baseline that complements
the LLM subjective score. The same CV always produces the same numbers.
"""

import re
import statistics

# ---------------------------------------------------------------------------
# Verb lists
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
# Traditional bullet chars
_EXPLICIT_BULLET = re.compile(r"^[\s]*[-•●◆▪▸►*]\s+(.+)$", re.MULTILINE)
# Numbered list: 1. text or (1) text
_NUMBERED_BULLET = re.compile(r"^\s*\(\d+\)\s+(.+)$|\s*\d+\.\s+([A-Z].+)$", re.MULTILINE)
_NUMBER_IN_TEXT = re.compile(r"\d+(?:[.,]\d+)?(?:\s*[%xX×])?|\$[\d,]+|Rp[\s\d,.]+")
# Year ranges — used for employment gap detection
_YEAR_RANGE = re.compile(r"(\d{4})\s*[-–—]\s*(\d{4}|present|current|now|sekarang)", re.IGNORECASE)
_LINKEDIN = re.compile(r"linkedin\.com/in/", re.IGNORECASE)
_GITHUB = re.compile(r"github\.com/", re.IGNORECASE)
_PORTFOLIO = re.compile(r"https?://(?!github|linkedin)[\w.-]+\.[a-z]{2,}", re.IGNORECASE)

_EXPECTED_SECTIONS = {"experience", "education", "skills", "summary", "contact", "projects"}

# Section keywords used to identify experience text from free text
_EXP_SECTION_KEYWORDS = re.compile(
    r"\b(?:experience|work|employment|professional|position|career|job|internship|freelance)\b",
    re.IGNORECASE,
)
_EDU_SECTION_KEYWORDS = re.compile(
    r"\b(?:education|university|college|degree|bachelor|master|phd|diploma|certification|course|training)\b",
    re.IGNORECASE,
)


# ---------------------------------------------------------------------------
# Bullet / achievement line extraction
# ---------------------------------------------------------------------------

def _extract_bullets(text: str, nlp_result: dict | None = None) -> list[str]:
    """Extract achievement lines from CV text.

    Handles:
    - Traditional bullet chars (•, -, *, etc.)
    - PDF-extracted text where lines are indented with spaces (no bullet char)
    - Numbered lists
    """
    # 1. Traditional explicit bullets
    explicit = [m.group(1).strip() for m in _EXPLICIT_BULLET.finditer(text)]
    if explicit:
        return explicit

    # 2. Numbered bullets
    numbered: list[str] = []
    for m in _NUMBERED_BULLET.finditer(text):
        line = (m.group(1) or m.group(2) or "").strip()
        if len(line.split()) >= 4:
            numbered.append(line)
    if numbered:
        return numbered

    # 3. Fallback: indented achievement lines (PDF extraction artifact)
    # Lines with 3+ leading spaces, 5+ words, not all-caps (not section headers)
    indent_lines: list[str] = []
    for line in text.splitlines():
        stripped = line.lstrip(" \t")
        indent = len(line) - len(stripped)
        words = stripped.split()
        if (
            indent >= 3
            and len(words) >= 5
            and not stripped.isupper()
            and not stripped.endswith(":")
            and not stripped.startswith("#")
        ):
            indent_lines.append(stripped)

    return indent_lines


# ---------------------------------------------------------------------------
# Individual metric helpers
# ---------------------------------------------------------------------------

def _quantification_ratio(bullets: list[str]) -> float:
    if not bullets:
        return 0.0
    with_numbers = sum(1 for b in bullets if _NUMBER_IN_TEXT.search(b))
    return round(with_numbers / len(bullets), 3)


def _action_verb_ratio(bullets: list[str]) -> dict:
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


def _employment_gaps(text: str, nlp_result: dict | None = None) -> dict:
    """Detect employment gaps >3 months.

    Uses experience section text when available (from nlp_result) to avoid
    false positives from education dates.
    """
    import datetime
    _PRESENT_YEAR = datetime.date.today().year

    # Prefer experience section text to avoid education date false-positives
    exp_text = text
    if nlp_result:
        sections = nlp_result.get("sections", [])
        exp_parts = [
            s.get("text", "")
            for s in sections
            if s.get("type") in {"experience", "work"}
        ]
        if exp_parts:
            exp_text = " ".join(exp_parts)

    year_ranges = _YEAR_RANGE.findall(exp_text)
    if len(year_ranges) < 2:
        return {"gaps_found": 0, "longest_gap_months": 0}

    pairs: list[tuple[int, int]] = []
    for start, end in year_ranges:
        try:
            s = int(start)
            e = _PRESENT_YEAR if str(end).lower() in {"present", "current", "now", "sekarang"} else int(end)
            if 1990 <= s <= _PRESENT_YEAR and s <= e:
                pairs.append((s, e))
        except ValueError:
            continue

    if len(pairs) < 2:
        return {"gaps_found": 0, "longest_gap_months": 0}

    pairs_sorted = sorted(pairs, key=lambda x: x[0])
    gaps_months: list[int] = []
    for i in range(1, len(pairs_sorted)):
        prev_end = pairs_sorted[i - 1][1]
        curr_start = pairs_sorted[i][0]
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
    q_ratio    = metrics.get("quantification_ratio", 0)
    verb       = metrics.get("action_verb_ratio", {})
    strong_r   = verb.get("strong_ratio", 0)
    weak_r     = verb.get("weak_ratio", 0)
    passive    = metrics.get("passive_voice_ratio", 0)
    section    = metrics.get("section_coverage", {}).get("score", 0) / 100
    skill_pres = metrics.get("skill_presence_in_experience", 0)
    contact    = metrics.get("contact_signals", {})
    gap        = metrics.get("employment_gaps", {}).get("longest_gap_months", 0)

    contact_score = sum([
        contact.get("has_email", False),
        contact.get("has_phone", False),
        contact.get("has_linkedin", False),
    ]) / 3

    gap_penalty = min(gap / 24, 0.5)  # max 50-pt penalty at 24 months gap

    raw = (
        q_ratio    * 25 +
        strong_r   * 20 +
        (1 - weak_r) * 10 +
        (1 - passive) * 10 +
        section    * 20 +
        skill_pres * 10 +
        contact_score * 5
    ) - gap_penalty * 20

    return max(0, min(100, int(raw)))


# ---------------------------------------------------------------------------
# Score adjustment layer
# ---------------------------------------------------------------------------

_SCORE_WEIGHTS = {"impact": 0.35, "clarity": 0.30, "relevance": 0.20, "completeness": 0.15}


def apply_score_adjustments(
    llm_scores: dict,
    metrics: dict,
) -> tuple[dict, bool]:
    """Nudge LLM scores using deterministic signals (±10 pt max per dimension).

    Returns (adjusted_scores_dict, low_confidence_bool).
    If bullet_count < 3, metrics are unreliable — scores unchanged, low_confidence=True.
    """
    adjusted = dict(llm_scores)
    low_confidence = False

    bullet_count = metrics.get("bullet_count", 0)
    if bullet_count < 3:
        # Can't trust per-bullet ratios with so few data points
        low_confidence = True
        return adjusted, low_confidence

    quant_ratio = metrics.get("quantification_ratio", 0.0)
    verb        = metrics.get("action_verb_ratio", {})
    strong_r    = verb.get("strong_ratio", 0.0)
    passive_r   = metrics.get("passive_voice_ratio", 0.0)
    avg_len     = metrics.get("avg_bullet_length_words", 12.0)
    sec_score   = metrics.get("section_coverage", {}).get("score", 50) / 100

    # --- Impact: quantification & action verb signals ---
    impact_adj = 0
    if quant_ratio < 0.10:
        impact_adj -= 7   # nearly no numbers → can't justify high impact
    elif quant_ratio >= 0.50:
        impact_adj += 3   # well quantified
    if strong_r < 0.20:
        impact_adj -= 4   # mostly weak/passive verbs
    elif strong_r >= 0.60:
        impact_adj += 2
    impact_adj = max(-10, min(10, impact_adj))

    # --- Clarity: passive voice & bullet length ---
    clarity_adj = 0
    if passive_r > 0.30:
        clarity_adj -= 5
    if avg_len > 30:
        clarity_adj -= 3  # bullets are walls of text
    elif 8 <= avg_len <= 20:
        clarity_adj += 2  # optimal length
    clarity_adj = max(-10, min(10, clarity_adj))

    # --- Completeness: section coverage is objective ---
    completeness_adj = 0
    if sec_score < 0.50:
        completeness_adj -= 8
    elif sec_score >= 0.83:
        completeness_adj += 3
    completeness_adj = max(-10, min(10, completeness_adj))

    adjusted["impact"]       = max(0, min(100, adjusted.get("impact", 50)       + impact_adj))
    adjusted["clarity"]      = max(0, min(100, adjusted.get("clarity", 50)      + clarity_adj))
    adjusted["completeness"] = max(0, min(100, adjusted.get("completeness", 50) + completeness_adj))

    # Recompute overall
    adjusted["overall"] = max(0, min(100, int(
        sum(adjusted.get(d, 50) * w for d, w in _SCORE_WEIGHTS.items())
    )))

    # Consistency guard: flag when LLM impact >> deterministic proxy
    det_impact_proxy = quant_ratio * 50 + strong_r * 50
    if abs(llm_scores.get("impact", 50) - det_impact_proxy) > 25:
        low_confidence = True

    return adjusted, low_confidence


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def compute_deterministic_metrics(
    cv_text: str,
    nlp_result: dict | None = None,
) -> dict:
    """Return fully reproducible CV quality metrics — no LLM, no randomness."""
    bullets = _extract_bullets(cv_text, nlp_result)

    metrics = {
        "bullet_count": len(bullets),
        "word_count": len(cv_text.split()),
        "quantification_ratio": _quantification_ratio(bullets),
        "action_verb_ratio": _action_verb_ratio(bullets),
        "passive_voice_ratio": _passive_voice_ratio(cv_text),
        "avg_bullet_length_words": _avg_bullet_length(bullets),
        "section_coverage": _section_coverage(nlp_result),
        "skill_presence_in_experience": _skill_presence_in_experience(nlp_result),
        "employment_gaps": _employment_gaps(cv_text, nlp_result),
        "contact_signals": _contact_signals(cv_text),
    }
    metrics["objective_score"] = _objective_score(metrics)
    return metrics
