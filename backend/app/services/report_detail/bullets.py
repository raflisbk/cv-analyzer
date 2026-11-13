import re

from app.models.job import Job
from app.schemas.report_detail import ReportBullet

ACTION_VERBS = frozenset(
    {
        "built",
        "created",
        "designed",
        "developed",
        "delivered",
        "drove",
        "improved",
        "increased",
        "led",
        "launched",
        "reduced",
        "saved",
        "scaled",
        "cut",
        "automated",
        "managed",
        "implemented",
    }
)
BULLET_PREFIX = re.compile(r"^\s*(?:[-*•]|\d+[.)])\s+")
NUMBER = re.compile(r"\b\d+(?:[.,]\d+)?%?\b")
MIN_WORDS = 6
MAX_WORDS = 30
MAX_BULLETS = 12


def bullet_lines(text: str) -> list[str]:
    return [
        BULLET_PREFIX.sub("", line).strip()
        for line in text.splitlines()
        if BULLET_PREFIX.match(line)
    ]


def bullet_view(text: str, source: str) -> ReportBullet:
    words = text.split()
    action = bool(words and words[0].lower().rstrip(".,;:") in ACTION_VERBS)
    number = bool(NUMBER.search(text))
    length = MIN_WORDS <= len(words) <= MAX_WORDS
    signals = sum((action, number, length))
    tags = [
        label
        for flag, label in (
            (action, "Action verb"),
            (number, "Number"),
            (length, "Scannable length"),
        )
        if flag
    ]
    return ReportBullet(
        text=text,
        source=source,
        strength="strong" if signals == 3 else "fair" if signals >= 2 else "weak",
        tags=tags,
    )


def experience_bullets(job: Job) -> list[ReportBullet]:
    output = []
    for section in (job.nlp_result or {}).get("sections", []):
        if section.get("type") != "experience":
            continue
        source = "Experience"
        for line in str(section.get("text") or "").splitlines():
            if BULLET_PREFIX.match(line):
                output.append(bullet_view(BULLET_PREFIX.sub("", line).strip(), source))
            elif line.strip():
                source = line.strip()
            if len(output) == MAX_BULLETS:
                return output
    return output
