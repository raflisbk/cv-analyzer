import re
from decimal import Decimal

from pydantic import BaseModel

NUMBER = re.compile(
    r"(?<![\w])(?:[$€£])?(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?\s*([kKmM])?(?:\s*(?:%|percent))?(?!\w)"
)
PLACEHOLDER = re.compile(r"\[[^\]\n]+\]")
KNOWN_INPUTS = {"[%]", "[amount]", "[N]", "[timeframe]", "[team size]"}


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
        "[timeframe]": "What timeframe?",
        "[team size]": "What was the team size?",
    }.get(token, token[1:-1].strip())
