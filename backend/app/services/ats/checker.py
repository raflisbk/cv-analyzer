import re

from app.services.nlp.section_detector import CvSection

_ACTION_VERBS: set[str] = {
    "accelerated",
    "achieved",
    "acquired",
    "administered",
    "advanced",
    "analyzed",
    "architected",
    "arranged",
    "assessed",
    "audited",
    "authored",
    "automated",
    "balanced",
    "boosted",
    "briefed",
    "budgeted",
    "built",
    "cataloged",
    "centralized",
    "championed",
    "coached",
    "collaborated",
    "compiled",
    "completed",
    "composed",
    "conceptualized",
    "consolidated",
    "constructed",
    "consulted",
    "contributed",
    "controlled",
    "converted",
    "convinced",
    "coordinated",
    "created",
    "cultivated",
    "customized",
    "decreased",
    "defined",
    "delegated",
    "delivered",
    "demonstrated",
    "designed",
    "developed",
    "devised",
    "directed",
    "discovered",
    "doubled",
    "drafted",
    "drove",
    "earned",
    "edited",
    "educated",
    "elevated",
    "eliminated",
    "engineered",
    "enhanced",
    "ensured",
    "established",
    "evaluated",
    "exceeded",
    "executed",
    "expanded",
    "expedited",
    "facilitated",
    "finalized",
    "forecasted",
    "formalized",
    "formulated",
    "founded",
    "generated",
    "governed",
    "grew",
    "headed",
    "hired",
    "identified",
    "illustrated",
    "implemented",
    "improved",
    "increased",
    "influenced",
    "initiated",
    "innovated",
    "inspected",
    "inspired",
    "instituted",
    "integrated",
    "introduced",
    "invented",
    "investigated",
    "launched",
    "led",
    "leveraged",
    "maintained",
    "managed",
    "maximized",
    "measured",
    "mentored",
    "merged",
    "minimized",
    "mobilized",
    "modernized",
    "monitored",
    "motivated",
    "navigated",
    "negotiated",
    "optimized",
    "orchestrated",
    "organized",
    "outperformed",
    "overhauled",
    "oversaw",
    "partnered",
    "performed",
    "persuaded",
    "pioneered",
    "planned",
    "prepared",
    "presented",
    "prioritized",
    "processed",
    "produced",
    "programmed",
    "proposed",
    "provided",
    "published",
    "raised",
    "reconciled",
    "recruited",
    "redesigned",
    "reduced",
    "refactored",
    "reformed",
    "remodeled",
    "reorganized",
    "resolved",
    "restored",
    "restructured",
    "revamped",
    "reviewed",
    "revitalized",
    "saved",
    "scaled",
    "scheduled",
    "secured",
    "shaped",
    "shipped",
    "simplified",
    "solved",
    "spearheaded",
    "standardized",
    "steered",
    "streamlined",
    "strengthened",
    "structured",
    "supervised",
    "surpassed",
    "sustained",
    "synthesized",
    "targeted",
    "trained",
    "transformed",
    "translated",
    "troubleshot",
    "unified",
    "upgraded",
    "validated",
    "verified",
    "visualized",
    "volunteered",
    "won",
    "wrote",
}

_ACTION_VERBS_INDONESIAN: set[str] = {
    "mengelola",
    "memimpin",
    "mengembangkan",
    "menciptakan",
    "merancang",
    "menganalisis",
    "mengoptimalkan",
    "meningkatkan",
    "mengimplementasikan",
    "mengkoordinasi",
    "melatih",
    "mengevaluasi",
    "mengatur",
    "menyusun",
    "membangun",
    "mengarahkan",
    "menyelesaikan",
    "mengontrol",
    "memonitor",
    "memproduksi",
    "menghitung",
    "menegosiasi",
    "mempresentasikan",
    "menghubungi",
    "mengoperasikan",
    "memperbaiki",
    "merencanakan",
    "melaksanakan",
    "mengawasi",
}

_REQUIRED_SECTIONS: set[str] = {"experience", "education", "skills"}

_TABLE_PATTERN = re.compile(r"[|]{2,}|\t.*\t.*\t")
_IMAGE_PATTERN = re.compile(r"\[IMAGE\]|\[PHOTO\]|<img", re.IGNORECASE)
_SPECIAL_CHAR_PATTERN = re.compile(r"[^\w\s@.\-+:/,()&#'\"\n]")
_DATE_PATTERN = re.compile(
    r"\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)"
    r"\s+\d{4}"
    r"|\d{1,2}/\d{4}"
    r"|\d{4}\s*[-]\s*(?:\d{4}|present|current|now|sekarang)",
    re.IGNORECASE,
)
_BULLET_PATTERN = re.compile(r"^[•●◆▪▸►\-\*]\s", re.MULTILINE)
_QUANTIFIED_PATTERN = re.compile(
    r"\b\d+(?:\.\d+)?%\s"
    r"|\$[\d,]+"
    r"|\bRp\s?[\d,.]+\b"
    r"|\b\d{2,}\+?\s*(?:users?|clients?|customers?|projects?|team|people|staff|members?|accounts?|sales?|units?|orders?|tickets?|calls?|reports?)\b",
    re.IGNORECASE,
)
_LINKEDIN_PATTERN = re.compile(r"linkedin\.com/in/", re.IGNORECASE)
_URL_PATTERN = re.compile(r"https?://(?:www\.)?[\w.-]+\.[a-z]{2,}", re.IGNORECASE)
_HEADER_PATTERN = re.compile(r"^#{1,3}\s", re.MULTILINE)

_MIN_ACTION_VERBS_PASS = 8
_MIN_ACTION_VERBS_WARN = 4
_MIN_CV_WORDS = 250
_MAX_CV_WORDS = 1000
_MIN_DATES_PASS = 3
_MIN_BULLETS_PASS = 5
_MIN_BULLETS_WARN = 2
_MIN_QUANTIFIED_PASS = 3
_MAX_SPECIAL_RATIO_WARN = 0.05
_MAX_SPECIAL_RATIO_FAIL = 0.15
_MAX_URLS_WARN = 10


def check_ats_compatibility(
    text: str,
    sections: list[CvSection] | None = None,
) -> list[dict]:
    results: list[dict] = []
    section_types = {s.type for s in sections} if sections else set()

    missing_required = _REQUIRED_SECTIONS - section_types
    if not missing_required:
        results.append(
            {
                "check": "Standard sections present",
                "status": "pass",
                "detail": "Experience, Education, and Skills sections detected.",
            }
        )
    elif len(missing_required) == 1:
        section = next(iter(missing_required))
        results.append(
            {
                "check": "Standard sections present",
                "status": "warn",
                "detail": (
                    f"Missing section: {section.capitalize()}. "
                    f"Add a clearly labeled '{section.upper()}' heading."
                ),
            }
        )
    else:
        results.append(
            {
                "check": "Standard sections present",
                "status": "fail",
                "detail": (
                    f"Missing sections: {', '.join(s.capitalize() for s in missing_required)}. "
                    "ATS may reject this CV."
                ),
            }
        )

    if _TABLE_PATTERN.search(text):
        results.append(
            {
                "check": "No tables detected",
                "status": "warn",
                "detail": "Table-like formatting detected. Many ATS systems cannot parse tables correctly.",
            }
        )
    else:
        results.append(
            {
                "check": "No tables detected",
                "status": "pass",
                "detail": "No table formatting found.",
            }
        )

    if _IMAGE_PATTERN.search(text):
        results.append(
            {
                "check": "No images detected",
                "status": "fail",
                "detail": "Image or photo markers detected. ATS systems cannot read images.",
            }
        )
    else:
        results.append(
            {
                "check": "No images detected",
                "status": "pass",
                "detail": "No image markers found.",
            }
        )

    words_lower = set(re.findall(r"\b[a-z]+\b", text.lower()))
    action_verbs_found = (words_lower & _ACTION_VERBS) | (
        words_lower & _ACTION_VERBS_INDONESIAN
    )
    action_verb_count = len(action_verbs_found)

    if action_verb_count >= _MIN_ACTION_VERBS_PASS:
        results.append(
            {
                "check": "Action verb density",
                "status": "pass",
                "detail": (
                    f"{action_verb_count} action verbs found: "
                    f"{', '.join(sorted(action_verbs_found)[:5])}..."
                ),
            }
        )
    elif action_verb_count >= _MIN_ACTION_VERBS_WARN:
        results.append(
            {
                "check": "Action verb density",
                "status": "warn",
                "detail": (
                    f"Only {action_verb_count} action verbs found. "
                    "Aim for 8+ strong action verbs (led, built, improved, etc.)."
                ),
            }
        )
    else:
        results.append(
            {
                "check": "Action verb density",
                "status": "fail",
                "detail": (
                    f"Only {action_verb_count} action verb(s) found. "
                    "Add strong action verbs to bullet points."
                ),
            }
        )

    has_email = bool(re.search(r"[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}", text))
    has_phone = bool(re.search(r"[\+]?[\d\s\-().]{9,15}", text))

    if has_email and has_phone:
        results.append(
            {
                "check": "Contact information complete",
                "status": "pass",
                "detail": "Email and phone number detected.",
            }
        )
    elif has_email or has_phone:
        results.append(
            {
                "check": "Contact information complete",
                "status": "warn",
                "detail": "Only partial contact info found. Include both email and phone number.",
            }
        )
    else:
        results.append(
            {
                "check": "Contact information complete",
                "status": "fail",
                "detail": "No email or phone number detected. ATS requires contact information.",
            }
        )

    word_count = len(text.split())
    if _MIN_CV_WORDS <= word_count <= _MAX_CV_WORDS:
        results.append(
            {
                "check": "Appropriate CV length",
                "status": "pass",
                "detail": f"{word_count} words - within optimal 250-1000 word range.",
            }
        )
    elif word_count < _MIN_CV_WORDS:
        results.append(
            {
                "check": "Appropriate CV length",
                "status": "warn",
                "detail": (
                    f"Only {word_count} words. "
                    "Consider adding more detail to experience and skills sections."
                ),
            }
        )
    else:
        results.append(
            {
                "check": "Appropriate CV length",
                "status": "warn",
                "detail": (
                    f"{word_count} words - consider trimming to under 1000 words "
                    "for better ATS parsing."
                ),
            }
        )

    date_matches = _DATE_PATTERN.findall(text)
    if len(date_matches) >= _MIN_DATES_PASS:
        results.append(
            {
                "check": "Date formatting",
                "status": "pass",
                "detail": f"{len(date_matches)} date entries found with consistent formatting.",
            }
        )
    elif date_matches:
        results.append(
            {
                "check": "Date formatting",
                "status": "warn",
                "detail": (
                    f"Only {len(date_matches)} date(s) found. "
                    "Ensure all experience entries have clear dates (e.g., 'Jan 2020 - Present')."
                ),
            }
        )
    else:
        results.append(
            {
                "check": "Date formatting",
                "status": "fail",
                "detail": "No date patterns found. ATS relies on dates to calculate experience duration.",
            }
        )

    bullets = _BULLET_PATTERN.findall(text)
    bullet_count = len(bullets)
    if bullet_count >= _MIN_BULLETS_PASS:
        results.append(
            {
                "check": "Bullet point usage",
                "status": "pass",
                "detail": f"{bullet_count} bullet points found. Good use of structured formatting.",
            }
        )
    elif bullet_count >= _MIN_BULLETS_WARN:
        results.append(
            {
                "check": "Bullet point usage",
                "status": "warn",
                "detail": (
                    f"Only {bullet_count} bullet points found. "
                    "Use more bullets (•, -, *) to list achievements for better ATS readability."
                ),
            }
        )
    else:
        results.append(
            {
                "check": "Bullet point usage",
                "status": "warn",
                "detail": "Very few or no bullet points detected. Use bullet points for achievements and responsibilities.",
            }
        )

    quantified_matches = _QUANTIFIED_PATTERN.findall(text)
    if len(quantified_matches) >= _MIN_QUANTIFIED_PASS:
        results.append(
            {
                "check": "Quantified achievements",
                "status": "pass",
                "detail": f"{len(quantified_matches)} quantified achievements found. Strong use of metrics.",
            }
        )
    elif quantified_matches:
        results.append(
            {
                "check": "Quantified achievements",
                "status": "warn",
                "detail": (
                    f"Only {len(quantified_matches)} quantified achievement(s). "
                    "Add more numbers: percentages, dollar amounts, team sizes, user counts."
                ),
            }
        )
    else:
        results.append(
            {
                "check": "Quantified achievements",
                "status": "warn",
                "detail": "No quantified achievements found. Add specific numbers and metrics to demonstrate impact.",
            }
        )

    if _LINKEDIN_PATTERN.search(text):
        results.append(
            {
                "check": "LinkedIn profile",
                "status": "pass",
                "detail": "LinkedIn profile URL detected.",
            }
        )
    else:
        results.append(
            {
                "check": "LinkedIn profile",
                "status": "warn",
                "detail": "No LinkedIn profile URL found. Adding one strengthens your professional presence.",
            }
        )

    special_count = len(_SPECIAL_CHAR_PATTERN.findall(text))
    word_total = max(len(text.split()), 1)
    special_ratio = special_count / word_total

    if special_ratio < _MAX_SPECIAL_RATIO_WARN:
        results.append(
            {
                "check": "Clean formatting",
                "status": "pass",
                "detail": "Minimal special characters detected. ATS-friendly formatting.",
            }
        )
    elif special_ratio < _MAX_SPECIAL_RATIO_FAIL:
        results.append(
            {
                "check": "Clean formatting",
                "status": "warn",
                "detail": "Moderate special character usage detected. Some ATS systems may have parsing issues.",
            }
        )
    else:
        results.append(
            {
                "check": "Clean formatting",
                "status": "fail",
                "detail": "Heavy special character usage detected. ATS may fail to parse content correctly.",
            }
        )

    if _HEADER_PATTERN.search(text):
        results.append(
            {
                "check": "Markdown headers",
                "status": "warn",
                "detail": "Markdown-style headers (#) detected. Ensure they map to proper section headings for ATS.",
            }
        )

    urls = _URL_PATTERN.findall(text)
    if len(urls) > _MAX_URLS_WARN:
        results.append(
            {
                "check": "URL density",
                "status": "warn",
                "detail": f"{len(urls)} URLs found. Too many links may clutter the CV. Keep only relevant ones.",
            }
        )

    return results


# ---------------------------------------------------------------------------
# Numeric ATS score
# ---------------------------------------------------------------------------

_CHECK_WEIGHTS: dict[str, int] = {
    "Standard sections present": 15,
    "Contact information complete": 15,
    "Quantified achievements": 15,
    "Action verb density": 12,
    "Date formatting": 10,
    "Bullet point usage": 10,
    "Appropriate CV length": 8,
    "LinkedIn profile": 5,
    "No tables detected": 5,
    "No images detected": 5,
}
_DEFAULT_CHECK_WEIGHT = 2  # unweighted checks


def compute_ats_score(ats_checks: list[dict]) -> int:
    """Convert ATS checklist to a numeric score 0–100.

    pass=full weight, warn=half weight, fail=0.
    """
    if not ats_checks:
        return 0

    score = 0.0
    for check in ats_checks:
        name = check.get("check", "")
        status = check.get("status", "fail")
        w = _CHECK_WEIGHTS.get(name, _DEFAULT_CHECK_WEIGHT)
        if status == "pass":
            score += w
        elif status == "warn":
            score += w * 0.5

    # Normalize to 100 using expected max from defined weights
    max_score = sum(_CHECK_WEIGHTS.values())
    return min(100, int(score / max_score * 100))

    return results
