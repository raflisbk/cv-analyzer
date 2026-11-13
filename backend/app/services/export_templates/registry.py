from functools import lru_cache
from typing import Any

from app.services.ats.checker import check_ats_compatibility, compute_ats_score
from app.services.export_templates.html_pdf import extract_pdf_text, render_pdf

_TEMPLATES = (
    (
        "original",
        "Your original",
        "Keep the layout you uploaded.",
        ("Keeps your layout", "Selectable text"),
    ),
    (
        "classic",
        "Classic",
        "Traditional CV for formal roles.",
        ("Single column", "Standard fonts", "No tables"),
    ),
    (
        "modern",
        "Modern",
        "Clear hierarchy with a subtle accent.",
        ("Single column", "Standard fonts", "No tables"),
    ),
    (
        "compact",
        "Compact",
        "Dense layout for a longer career.",
        ("Single column", "Compact spacing", "No tables"),
    ),
    (
        "plain",
        "Plain",
        "Minimal styling for strict parsers.",
        ("Single column", "Standard headings", "No tables"),
    ),
)
_SAMPLE = {
    "sections": [
        {"type": "header", "content": "Alex Morgan\nalex@example.com\n+1 555 0100"},
        {
            "type": "experience",
            "content": "Experience\nEngineer at Acme, 2020-2024\nBuilt reporting tools for 5 teams.",
        },
        {"type": "education", "content": "Education\nBS Computer Science, 2019"},
        {"type": "skills", "content": "Skills\nPython, SQL, communication"},
    ]
}


@lru_cache(maxsize=4)
def template_ats_score(template_id: str) -> int:
    text = extract_pdf_text(render_pdf(template_id, _SAMPLE))
    return compute_ats_score(check_ats_compatibility(text))


def template_list(original_score: int | None = None) -> list[dict[str, Any]]:
    return [
        {
            "id": key,
            "name": name,
            "description": description,
            "atsScore": (
                original_score if key == "original" else template_ats_score(key)
            ),
            "original": key == "original",
            "traits": list(traits),
        }
        for key, name, description, traits in _TEMPLATES
    ]


def known_template(template_id: str) -> bool:
    return any(key == template_id for key, *_ in _TEMPLATES)


def score_original(data: bytes, file_type: str) -> int | None:
    if file_type == ".pdf":
        text = extract_pdf_text(data)
    elif file_type == ".docx":
        from io import BytesIO
        from docx import Document

        text = "\n".join(part.text for part in Document(BytesIO(data)).paragraphs)
    else:
        return None
    return compute_ats_score(check_ats_compatibility(text))
