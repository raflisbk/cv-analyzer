import re
from dataclasses import dataclass, field

SECTION_PATTERNS: dict[str, list[str]] = {
    "header": [],
    "summary": [
        "summary",
        "objective",
        "profile",
        "about",
        "overview",
        "introduction",
        "profil",
        "ringkasan",
        "tentang saya",
        "profil profesional",
        "profil singkat",
        "career objective",
        "professional summary",
        "personal statement",
        "career summary",
    ],
    "experience": [
        "experience",
        "work history",
        "employment",
        "career",
        "work experience",
        "professional experience",
        "pengalaman",
        "pengalaman kerja",
        "pengalaman profesional",
        "riwayat kerja",
        "riwayat pekerjaan",
        "pengalaman bekerja",
        "work history",
        "professional background",
        "relevant experience",
        "work background",
        "career history",
    ],
    "education": [
        "education",
        "academic",
        "qualification",
        "degree",
        "studies",
        "pendidikan",
        "riwayat pendidikan",
        "latar belakang pendidikan",
        "pendidikan terakhir",
        "akademik",
        "kualifikasi",
        "educational background",
        "academic qualifications",
        "academic background",
    ],
    "skills": [
        "skills",
        "competencies",
        "technologies",
        "technical",
        "expertise",
        "proficiencies",
        "keterampilan",
        "keahlian",
        "kemampuan",
        "keahlian teknis",
        "keterampilan teknis",
        "kompetensi",
        "core competencies",
        "technical skills",
        "key skills",
        "areas of expertise",
        "core skills",
        "tools & technologies",
    ],
    "projects": [
        "projects",
        "portfolio",
        "work samples",
        "personal projects",
        "proyek",
        "portfolio",
        "proyek pribadi",
        "project experience",
        "key projects",
        "selected projects",
        "notable projects",
    ],
    "certifications": [
        "certifications",
        "certificates",
        "licenses",
        "accreditations",
        "training",
        "sertifikasi",
        "sertifikat",
        "lisensi",
        "pelatihan",
        "professional certifications",
        "professional development",
        "licenses & certifications",
        "professional licenses",
    ],
    "languages": [
        "languages",
        "language proficiency",
        "bahasa",
        "kemampuan bahasa",
        "penguasaan bahasa",
        "language skills",
    ],
    "awards": [
        "awards",
        "honors",
        "achievements",
        "accomplishments",
        "penghargaan",
        "prestasi",
        "penghargaan & prestasi",
        "awards & achievements",
        "honors & awards",
        "recognition",
        "honors and awards",
    ],
    "references": [
        "references",
        "referees",
        "referensi",
        "referensi kontak",
        "daftar referensi",
    ],
    "volunteer": [
        "volunteer",
        "volunteering",
        "community service",
        "volunteer experience",
        "sosial",
        "kegiatan sosial",
        "relawan",
        "community involvement",
        "social activities",
    ],
    "publications": [
        "publications",
        "papers",
        "research",
        "articles",
        "publikasi",
        "penelitian",
        "jurnal",
        "research & publications",
        "academic publications",
    ],
    "interests": [
        "interests",
        "hobbies",
        "activities",
        "minat",
        "hobi",
        "minat & hobi",
        "hobbies & interests",
        "personal interests",
    ],
    "organizations": [
        "organizations",
        "memberships",
        "affiliations",
        "organisasi",
        "keanggotaan",
        "kegiatan organisasi",
        "professional affiliations",
        "professional memberships",
    ],
}

_MIN_HEADING_LEN = 3

_HEADING_UPPER_RE = re.compile(
    r"^[A-Z][A-Z\s&/\-]+[A-Z][\s:]*$",
    re.MULTILINE,
)

# "Strong" sections: main CV body — never leave these for a weak section without a preceding blank line.
_STRONG_SECTION_TYPES = frozenset(
    {"experience", "education", "skills", "projects", "certifications", "summary"}
)

# "Weak" section types that commonly appear as sub-headings inside experience/projects
# (e.g. "ACHIEVEMENTS:" inside a job entry).  Only recognised as a real section
# when preceded by at least one blank line.
_WEAK_SECTION_TYPES = frozenset(
    {"awards", "organizations", "volunteer", "interests", "publications", "references"}
)

# These keywords appear so commonly as sub-headings within job entries that they
# should NEVER cause a section switch when we are inside a strong section,
# regardless of whether a blank line precedes them.
# e.g. "ACHIEVEMENTS:" or "RESPONSIBILITIES:" inside an experience entry.
_EXPERIENCE_SUBHEADING_KEYWORDS = frozenset(
    {
        "achievements",
        "accomplishments",
        "responsibilities",
        "key responsibilities",
        "highlights",
        "deliverables",
        # Common "recognition" sub-headings within a job entry — not standalone sections
        "recognition",
        "honors",
        "production impact",
        "impact",
        "contributions",
        # Training/development headings that appear inside experience blocks
        "training",
        "learning",
        "development",
        "career development",
    }
)


@dataclass
class CvSection:

    type: str
    text: str
    start_line: int
    entities: list[dict] = field(default_factory=list)


def detect_sections(text: str) -> list[CvSection]:
    lines = text.splitlines()
    raw_sections: list[CvSection] = []
    current_type = "header"
    current_start = 0
    current_lines: list[str] = []
    prev_was_blank = False

    for i, line in enumerate(lines):
        stripped = line.strip()
        if not stripped:
            prev_was_blank = True
            current_lines.append(line)
            continue

        matched_type = _match_heading(stripped)

        # Rule 1: "other" (unrecognised ALL-CAPS) headings never cause a section
        # switch — they are absorbed as content of the current section.
        # This prevents job titles ("JUNIOR MACHINE LEARNING ENGINEER"),
        # company names, and unknown sub-headings (e.g. Indonesian "PENCAPAIAN")
        # from fragmenting the CV into spurious sections.
        if matched_type == "other":
            current_lines.append(line)
            prev_was_blank = False
            continue

        # Rule 2+3: inside a strong section, suppress section switches for:
        #   a) Any heading that contains a known sub-heading keyword (achievements,
        #      recognition, training, …) — these appear inside job entries, not as
        #      standalone sections.  Blocked regardless of blank-line context.
        #   b) Any "weak" section type (awards, volunteer, …) that is NOT preceded
        #      by a blank line — most likely a continuation bullet, not a new section.
        if current_type in _STRONG_SECTION_TYPES:
            is_known_subheading = any(
                kw in stripped.lower() for kw in _EXPERIENCE_SUBHEADING_KEYWORDS
            )
            if is_known_subheading:
                current_lines.append(line)
                prev_was_blank = False
                continue
            if matched_type in _WEAK_SECTION_TYPES and not prev_was_blank:
                current_lines.append(line)
                prev_was_blank = False
                continue

        if matched_type is not None and matched_type != current_type:
            content = "\n".join(current_lines).strip()
            if content:
                raw_sections.append(
                    CvSection(type=current_type, text=content, start_line=current_start)
                )
            current_type = matched_type
            current_start = i
            current_lines = []
        else:
            current_lines.append(line)

        prev_was_blank = False

    content = "\n".join(current_lines).strip()
    if content:
        raw_sections.append(
            CvSection(type=current_type, text=content, start_line=current_start)
        )

    return _deduplicate_sections(raw_sections)


def _deduplicate_sections(sections: list[CvSection]) -> list[CvSection]:
    """Merge repeated sections of the same type (e.g. skills x 3 -> skills x 1).

    Sub-headings inside a section often re-trigger the detector for the same
    type.  Collapsing duplicates into the first occurrence keeps downstream
    scoring and NLP clean without losing any content.
    """
    seen: dict[str, int] = {}
    result: list[CvSection] = []
    for section in sections:
        if section.type in ("header", "other"):
            result.append(section)
        elif section.type in seen:
            result[seen[section.type]].text += "\n\n" + section.text
        else:
            seen[section.type] = len(result)
            result.append(section)
    return result


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
