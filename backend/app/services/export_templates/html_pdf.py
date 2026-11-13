from pathlib import Path
from typing import Any

import fitz
from jinja2 import Environment, FileSystemLoader, select_autoescape
from weasyprint import HTML

_TEMPLATE_DIR = Path(__file__).resolve().parents[2] / "templates" / "export"
_ENV = Environment(
    loader=FileSystemLoader(str(_TEMPLATE_DIR)), autoescape=select_autoescape(["html"])
)


def render_html(template_id: str, document: dict[str, Any]) -> str:
    sections = []
    for section in document.get("sections", []):
        content = section.get("content") or section.get("text") or ""
        sections.append(
            {
                "title": section.get("title") or section.get("type", "").title(),
                "lines": content.splitlines(),
            }
        )
    return _ENV.get_template(f"{template_id}.html").render(sections=sections)


def render_pdf(template_id: str, document: dict[str, Any]) -> bytes:
    return HTML(string=render_html(template_id, document)).write_pdf()


def extract_pdf_text(data: bytes) -> str:
    with fitz.open(stream=data, filetype="pdf") as document:
        return "\n".join(page.get_text(sort=True) for page in document)
