import re

from app.models.job import Job
from app.schemas.report_detail import ReportSection
from app.services.report_detail.bullets import ACTION_VERBS, NUMBER, bullet_lines

HEADER_POINTS = 20
EDUCATION_POINTS = {"degree": 40, "institution": 30, "year": 30}
SKILL_POINTS = {"three": 60, "six": 80, "grouped": 20}
SUMMARY_POINTS = {"present": 40, "sentences": 30, "specific": 30}
EXPERIENCE_POINTS = {"dates": 30, "actions": 35, "metrics": 35}
NOTES = (
    (80, "Strong evidence in this section."),
    (50, "Add one more concrete detail to this section."),
    (1, "Add the missing details for this section."),
    (0, "This section is empty."),
)
EMAIL = re.compile(r"\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b")
PHONE = re.compile(r"(?:\+?\d[\d ()-]{7,}\d)")
YEAR = re.compile(r"\b(?:19|20)\d{2}\b")
DEGREE = re.compile(
    r"\b(?:bsc|ba|bs|bachelor|master|msc|mba|phd|diploma|sarjana|s1|s2|s3)\b", re.I
)
INSTITUTION = re.compile(
    r"\b(?:university|college|institute|school|universitas|institut|politeknik)\b", re.I
)
SPECIFIC = re.compile(
    r"\b(?:sql|python|excel|tableau|power bi|analytics|analysis|product|engineering|marketing|finance|design)\b",
    re.I,
)


def _header(text: str) -> int:
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    role = len(lines) > 1 and not EMAIL.search(lines[1]) and not PHONE.search(lines[1])
    location = any(
        1 <= len(line.split()) <= 4
        and not EMAIL.search(line)
        and not PHONE.search(line)
        and "http" not in line.lower()
        for line in lines[2:]
    )
    return HEADER_POINTS * sum(
        (
            bool(lines and len(lines[0].split()) >= 2),
            role,
            bool(EMAIL.search(text)),
            bool(PHONE.search(text)),
            location,
        )
    )


def _education(text: str) -> int:
    return sum(
        (
            EDUCATION_POINTS["degree"] * bool(DEGREE.search(text)),
            EDUCATION_POINTS["institution"] * bool(INSTITUTION.search(text)),
            EDUCATION_POINTS["year"] * bool(YEAR.search(text)),
        )
    )


def _skills(text: str) -> int:
    items = [item.strip() for item in re.split(r"[,;\n•]", text) if item.strip()]
    base = (
        SKILL_POINTS["six"]
        if len(items) >= 6
        else SKILL_POINTS["three"] if len(items) >= 3 else 20 * len(items)
    )
    grouped = bool(re.search(r"^[^\n:]{2,30}:\s*\S", text, re.M))
    return min(100, base + SKILL_POINTS["grouped"] * grouped)


def _summary(text: str) -> int:
    sentences = [part for part in re.split(r"[.!?]+", text) if part.strip()]
    return sum(
        (
            SUMMARY_POINTS["present"],
            SUMMARY_POINTS["sentences"] * (2 <= len(sentences) <= 4),
            SUMMARY_POINTS["specific"] * bool(SPECIFIC.search(text)),
        )
    )


def _experience(text: str) -> int:
    bullets = bullet_lines(text)
    action_share = sum(
        bool(b.split() and b.split()[0].lower() in ACTION_VERBS) for b in bullets
    ) / max(len(bullets), 1)
    metric_share = sum(bool(NUMBER.search(b)) for b in bullets) / max(len(bullets), 1)
    return min(
        100,
        EXPERIENCE_POINTS["dates"] * bool(YEAR.search(text))
        + round(EXPERIENCE_POINTS["actions"] * action_share)
        + round(EXPERIENCE_POINTS["metrics"] * metric_share),
    )


def section_score(text: str, kind: str) -> int:
    if not text.strip():
        return 0
    rubric = {
        "header": _header,
        "education": _education,
        "skills": _skills,
        "summary": _summary,
        "experience": _experience,
    }
    return rubric.get(kind.lower(), lambda _: 50)(text)


def sections(job: Job) -> list[ReportSection]:
    output = []
    for item in (job.nlp_result or {}).get("sections", []):
        text = str(item.get("text") or "")
        kind = str(item.get("type") or "Other")
        score = section_score(text, kind)
        note = next(note for floor, note in NOTES if score >= floor)
        output.append(ReportSection(name=kind.title(), score=score, note=note))
    return output
