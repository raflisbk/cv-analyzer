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
        "training",
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
