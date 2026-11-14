from functools import lru_cache
from typing import Any

from app.services.ats.checker import check_ats_compatibility, compute_ats_score
from app.services.export_templates.html_pdf import extract_pdf_text, render_pdf
from app.services.nlp.section_detector import detect_sections

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
        {
            "type": "header",
            "content": "Alex Morgan\nSenior Software Engineer\nalex@example.com\n+1 555 0100\nlinkedin.com/in/alexmorgan",
        },
        {
            "type": "experience",
            "content": "Engineer at Acme, 2020-2024\n"
            + "\n".join(
                (
                    "- Built reporting tools for 5 teams and documented results for product leaders across the organization.",
                    "- Led 12 engineers and improved release quality by 20% through careful reviews and clearer planning.",
                    "- Designed dashboards for 200 users and delivered weekly insights to sales and operations teams.",
                    "- Launched a new intake process that reduced response time by 35% for customer requests.",
                    "- Automated recurring reports and saved 40 hours each month for the finance department.",
                    "- Managed cross functional projects and implemented shared standards for reliable team communication.",
                    "- Created training material for new analysts and supported their first production assignments.",
                    "- Developed accessible documentation and tested workflows with colleagues from multiple departments.",
                    "- Increased adoption of internal tools through workshops and practical examples for managers.",
                    "- Coordinated planning sessions and evaluated progress against clear quarterly business goals.",
                )
            )
            + "\nAnalyst at Beta, 2018-2020\nSenior Analyst at Gamma, 2020-2022",
        },
        {"type": "education", "content": "BS Computer Science, State University, 2019"},
        {
            "type": "skills",
            "content": "Python, SQL, Tableau, Excel, reporting, communication",
        },
    ]
}


@lru_cache(maxsize=4)
def template_ats_score(template_id: str) -> int:
    text = extract_pdf_text(render_pdf(template_id, _SAMPLE))
    return compute_ats_score(check_ats_compatibility(text, detect_sections(text)))


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
