import re

from app.services.nlp.section_detector import CvSection


_ACTION_VERBS: set[str] = {
    "achieved",
    "architected",
    "automated",
    "built",
    "collaborated",
    "coordinated",
    "created",
    "delivered",
    "deployed",
    "designed",
    "developed",
    "drove",
    "engineered",
    "established",
    "executed",
    "implemented",
    "improved",
    "increased",
    "launched",
    "led",
    "managed",
    "mentored",
    "migrated",
    "optimized",
    "oversaw",
    "planned",
    "produced",
    "reduced",
    "refactored",
    "scaled",
    "shipped",
    "spearheaded",
    "streamlined",
    "transformed",
    "upgraded",
    "wrote",
}


_REQUIRED_SECTIONS: set[str] = {"experience", "education", "skills"}


_TABLE_PATTERN = re.compile(r"[|]{2,}|\t.*\t.*\t")
_IMAGE_PATTERN = re.compile(r"\[IMAGE\]|\[PHOTO\]|<img", re.IGNORECASE)

_MIN_ACTION_VERBS_PASS = 8
_MIN_ACTION_VERBS_WARN = 4
_MIN_CV_WORDS = 250
_MAX_CV_WORDS = 1000


def check_ats_compatibility(  # noqa: PLR0912
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
    action_verbs_found = words_lower & _ACTION_VERBS
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

    return results
