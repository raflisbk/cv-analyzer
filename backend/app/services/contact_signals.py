import re

_PHONE_CANDIDATE = re.compile(r"(?<![\w@/])\+?\(?\d[\d\s().\-]{6,20}\d(?![\w@])")
_YEAR_RANGE = re.compile(r"(?:(?:19|20)\d{2}(?:\s?[-–.]\s?|\s)?)+")
_THOUSANDS_GROUPED = re.compile(r"\d{1,3}(?:[.,]\d{3})+")

_EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}")
_LINKEDIN = re.compile(r"linkedin\.com/in/", re.IGNORECASE)
_GITHUB = re.compile(r"github\.com/", re.IGNORECASE)
_PORTFOLIO = re.compile(
    r"https?://(?!github|linkedin)[\w.-]+\.[a-z]{2,}", re.IGNORECASE
)

_MIN_PHONE_DIGITS = 8
_MAX_PHONE_DIGITS = 15


def has_phone_number(text: str) -> bool:
    for match in _PHONE_CANDIDATE.finditer(text):
        candidate = match.group(0).strip()
        digit_count = sum(char.isdigit() for char in candidate)
        if not _MIN_PHONE_DIGITS <= digit_count <= _MAX_PHONE_DIGITS:
            continue
        if _YEAR_RANGE.fullmatch(candidate) or _THOUSANDS_GROUPED.fullmatch(candidate):
            continue
        return True
    return False


def contact_signals(text: str) -> dict[str, bool]:
    return {
        "has_email": bool(_EMAIL.search(text)),
        "has_phone": has_phone_number(text),
        "has_linkedin": bool(_LINKEDIN.search(text)),
        "has_github": bool(_GITHUB.search(text)),
        "has_portfolio": bool(_PORTFOLIO.search(text)),
    }
