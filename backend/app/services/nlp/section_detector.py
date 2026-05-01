import re
from dataclasses import dataclass, field


SECTION_PATTERNS: dict[str, list[str]] = {
    "header": [],
    "summary": ["summary", "objective", "profile", "about", "overview", "introduction"],
    "experience": [
        "experience",
        "work history",
        "employment",
        "career",
        "work experience",
        "professional experience",
    ],
    "education": [
        "education",
        "academic",
        "qualification",
        "degree",
        "training",
        "studies",
    ],
    "skills": [
        "skills",
        "competencies",
        "technologies",
        "technical",
        "expertise",
        "proficiencies",
    ],
    "projects": ["projects", "portfolio", "work samples", "personal projects"],
    "certifications": [
        "certifications",
        "certificates",
        "licenses",
        "accreditations",
    ],
    "languages": ["languages", "language proficiency"],
    "awards": ["awards", "honors", "achievements", "accomplishments"],
    "references": ["references", "referees"],
}

_MIN_HEADING_LEN = 3


_HEADING_UPPER_RE = re.compile(
    r"^[A-Z][A-Z\s&/\-]+[A-Z][\s:]*$",
    re.MULTILINE,
)


@dataclass
class CvSection:

    type: str
    text: str
    start_line: int
    entities: list[dict] = field(default_factory=list)


def detect_sections(text: str) -> list[CvSection]:
    lines = text.splitlines()
    sections: list[CvSection] = []
    current_type = "header"
    current_start = 0
    current_lines: list[str] = []

    for i, line in enumerate(lines):
        stripped = line.strip()
        if not stripped:
            current_lines.append(line)
            continue

        matched_type = _match_heading(stripped)
        if matched_type is not None and matched_type != current_type:

            content = "\n".join(current_lines).strip()
            if content:
                sections.append(
                    CvSection(type=current_type, text=content, start_line=current_start)
                )
            current_type = matched_type
            current_start = i
            current_lines = []
        else:
            current_lines.append(line)

    content = "\n".join(current_lines).strip()
    if content:
        sections.append(
            CvSection(type=current_type, text=content, start_line=current_start)
        )

    return sections


def _match_heading(line: str) -> str | None:
    lower = line.lower().rstrip(":-. ")
    for section_type, keywords in SECTION_PATTERNS.items():
        if section_type == "header":
            continue
        if any(re.search(r"\b" + re.escape(kw) + r"\b", lower) for kw in keywords):
            return section_type

    if _HEADING_UPPER_RE.match(line) and len(line.strip()) >= _MIN_HEADING_LEN:
        return "other"

    return None
