import re
from decimal import Decimal

from pydantic import BaseModel

NUMBER = re.compile(
    r"(?<![\w])(?:[$€£])?(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?\s*([kKmM])?(?:\s*(?:%|percent))?(?!\w)"
)
PLACEHOLDER = re.compile(r"\[[^\]\n]+\]")
KNOWN_INPUTS = {"[%]", "[amount]", "[N]", "[how many?]", "[timeframe]", "[team size]"}


class NeedsInput(BaseModel):
    token: str
    question: str


def numbers_in(text: str) -> set[str]:
    facts = set()
    for match in NUMBER.finditer(text):
        value = Decimal(f"{match[1].replace(',', '')}.{match[2] or '0'}")
        if match[3]:
            value *= 1000 if match[3].lower() == "k" else 1000000
        facts.add(format(value.normalize(), "f"))
    return facts


def allowed_input(token: str) -> bool:
    return token in KNOWN_INPUTS or (
        len(token) <= 42 and token.endswith("?]") and len(token) > 3
    )


def input_question(token: str) -> str:
    return {
        "[%]": "What percentage?",
        "[amount]": "What amount?",
        "[N]": "What number?",
        "[how many?]": "How many?",
        "[timeframe]": "What timeframe?",
        "[team size]": "What was the team size?",
    }.get(token, token[1:-1].strip())


def replace_invented_numbers(rewrite: str, source: str) -> str | None:
    allowed = numbers_in(source)
    replacements = []
    for match in NUMBER.finditer(rewrite):
        if numbers_in(match.group()) <= allowed:
            continue
        token = match.group().strip()
        prefix = rewrite[max(0, match.start() - 12) : match.start()]
        if re.search(r"[A-Za-z]+[-/]$", prefix):
            return None
        if token.startswith(("$", "€", "£")):
            placeholder = "[amount]"
        elif token.endswith(("%", "percent")):
            placeholder = "[%]"
        elif 1900 <= int(match[1].replace(",", "")) <= 2099 or re.search(
            r"\b(?:year|month|week|day)s?\b",
            rewrite[match.end() : match.end() + 12],
            re.I,
        ):
            placeholder = "[timeframe]"
        else:
            placeholder = "[how many?]"
        replacements.append((match.start(), match.end(), placeholder))
    if len(replacements) + len(PLACEHOLDER.findall(rewrite)) > 3:
        return None
    for start, end, placeholder in reversed(replacements):
        rewrite = rewrite[:start] + placeholder + rewrite[end:]
    return rewrite
