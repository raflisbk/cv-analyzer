from typing import Any

from app.core.logging import structured_logger as logger


class PDFToHTMLConverter:

    SECTION_HEADING_MAP: dict[str, str] = {
        "header": "h1",
        "summary": "h2",
        "experience": "h2",
        "education": "h2",
        "skills": "h2",
        "projects": "h2",
        "certifications": "h2",
        "languages": "h2",
        "interests": "h2",
        "references": "h2",
        "awards": "h2",
        "publications": "h2",
        "volunteer": "h2",
    }

    def __init__(self):
        self.logger = logger

    def convert_to_html(
        self,
        source_text: str,
        sections: list[dict[str, Any]],
        anchors: list[dict[str, Any]],
        page_width: float = 595.5,
        page_height: float = 842.0,
    ) -> dict[str, Any]:
        if not sections:
            return self._empty_html()

        anchor_map = self._build_anchor_map(anchors)

        html_parts: list[str] = []

        for section in sections:
            section_type = section.get("type", "other")
            section_text = section.get("text", "")
            if not section_text:
                continue

            if section_type != "other":
                heading_tag = self.SECTION_HEADING_MAP.get(section_type, "h2")
                label = section_type.replace("_", " ").title()
                html_parts.append(f"<{heading_tag}>{label}</{heading_tag}>")

            html_parts.extend(
                self._render_section_body(section_text, section_type, anchor_map)
            )

        html = "\n".join(html_parts) if html_parts else "<p>No content available</p>"

        return {
            "html": html,
            "blocks": [],
            "metadata": {
                "page_width": page_width,
                "page_height": page_height,
                "section_count": len(sections),
                "block_count": 0,
            },
        }

    def _build_anchor_map(self, anchors: list[dict[str, Any]]) -> dict[str, dict]:
        anchor_map: dict[str, dict] = {}
        for anchor in anchors:
            text = anchor.get("text_preview", "") or anchor.get("text_anchor", "")
            if text:
                anchor_map[text.lower()] = anchor
        return anchor_map

    def _render_section_body(
        self,
        text: str,
        section_type: str,
        anchor_map: dict[str, dict],
    ) -> list[str]:
        parts: list[str] = []

        lines = text.strip().split("\n")

        if section_type == "skills":

            for line in lines:
                stripped = line.strip()
                if not stripped:
                    continue

                if len(stripped) < 60 and "," not in stripped:
                    parts.append(f"<h3>{stripped}</h3>")
                else:
                    parts.append(f"<p>{stripped}</p>")
        elif section_type == "header":

            for i, line in enumerate(lines):
                stripped = line.strip()
                if not stripped:
                    continue
                if i == 0:

                    parts.append(f"<p><strong>{stripped}</strong></p>")
                else:
                    parts.append(f"<p>{stripped}</p>")
        elif section_type in ("experience", "education", "projects"):

            for line in lines:
                stripped = line.strip()
                if not stripped:
                    continue

                if stripped[0] in "•·-–—*":
                    content = stripped.lstrip("•·-–—* ").strip()
                    parts.append(f"<ul><li>{content}</li></ul>")
                elif "|" in stripped and len(stripped) < 120:

                    parts.append(f"<p><strong>{stripped}</strong></p>")
                else:
                    parts.append(f"<p>{stripped}</p>")
        else:

            for line in lines:
                stripped = line.strip()
                if not stripped:
                    continue
                parts.append(f"<p>{stripped}</p>")

        return parts

    def _empty_html(self) -> dict[str, Any]:
        return {
            "html": "<p>No content available</p>",
            "blocks": [],
            "metadata": {
                "page_width": 595.5,
                "page_height": 842.0,
                "section_count": 0,
                "block_count": 0,
            },
        }
