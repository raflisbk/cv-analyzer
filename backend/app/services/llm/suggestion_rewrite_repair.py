import re

VAGUE_RESULT = re.compile(
    r"\b(significantly|substantially|considerably|drastically|greatly|dramatically)\b",
    re.I,
)
MONTH = (
    r"(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|"
    r"aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)"
)
DANGLING_MONTH = re.compile(rf"\b{MONTH}\.?$", re.I)
QUANTIFY_HINT = re.compile(r"quantif|metric|percent|measur|before-and-after", re.I)
DATE_HINT = re.compile(r"\b(end|start|complete|missing)\b.*\bdate\b|\bdate\b", re.I)
NAME_HINT = re.compile(r"\b(project|heading)\b.*\bname\b|\bproject name\b", re.I)
PLACEHOLDER = re.compile(r"\[[^\]\n]+\]")
RESULT_QUESTION = "[what was the measurable result?]"


def normalize_placeholders(rewrite: str, original: str) -> str:
    def swap(match: re.Match) -> str:
        token = match.group()
        if token in original:
            return token
        inner = token[1:-1].strip()
        if "%" in inner:
            return "[%]"
        if re.fullmatch(r"[A-Za-z]", inner):
            return "[N]"
        if re.search(r"\b(?:month|year)\b", inner, re.I):
            return "[month year]"
        return token

    return PLACEHOLDER.sub(swap, rewrite)


def _quantified(original: str) -> str:
    if VAGUE_RESULT.search(original):
        return VAGUE_RESULT.sub("by [%]", original, count=1)
    return f"{original.rstrip('. ')}, {RESULT_QUESTION}"


def _dated(original: str) -> str | None:
    if DANGLING_MONTH.search(original.rstrip()):
        return f"{original.rstrip()} [year]"
    return None


def _named(original: str) -> str:
    return f"[project name]: {original}"


def fallback_rewrite(suggestion: dict, original: str) -> str | None:
    text = str(suggestion.get("text", ""))
    if PLACEHOLDER.search(original):
        return None
    if suggestion.get("type") == "impact_metric" or QUANTIFY_HINT.search(text):
        return _quantified(original)
    if DATE_HINT.search(text):
        return _dated(original)
    if NAME_HINT.search(text):
        return _named(original)
    return None
