"""
PDF to HTML converter service.
Converts extracted PDF text and coordinates into HTML with exact PDF positioning.
Enables rendering CV as editable Tiptap editor while preserving original PDF layout.
"""

from typing import Any

from app.core.logging import structured_logger as logger


class PDFToHTMLConverter:
    """
    Converts PDF extraction results to HTML with exact positioning.

    Strategy:
    - Parse source_text into sections based on NLP section results
    - Use suggestion anchors for coordinate mapping
    - Generate HTML with absolute positioning to match PDF layout
    """

    def __init__(self):
        self.logger = logger

    def convert_to_html(
        self,
        source_text: str,
        sections: list[dict[str, Any]],
        anchors: list[dict[str, Any]],
        page_width: float = 595.5,  # A4 width in PDF points
        page_height: float = 842.0,  # A4 height in PDF points
    ) -> dict[str, Any]:
        """
        Convert PDF extraction to HTML structure for Tiptap editor.

        Args:
            source_text: Full extracted text from PDF
            sections: NLP section results with type and text
            anchors: Suggestion anchors with PDF coordinates
            page_width: PDF page width in points (default A4)
            page_height: PDF page height in points (default A4)

        Returns:
            dict with:
            - html: Complete HTML string
            - blocks: List of positioned text blocks
            - metadata: Page dimensions and section count
        """
        if not source_text:
            return self._empty_html()

        # Sort anchors by page and position (top to bottom, left to right)
        sorted_anchors = sorted(
            anchors,
            key=lambda a: (a.get("page_index", 0), a.get("rect", {}).get("y", 0))
        )

        # Create text blocks with positions
        blocks = []
        for section in sections:
            section_blocks = self._extract_section_blocks(
                section,
                source_text,
                sorted_anchors
            )
            blocks.extend(section_blocks)

        # Generate HTML
        html = self._generate_html(blocks, page_width, page_height)

        return {
            "html": html,
            "blocks": blocks,
            "metadata": {
                "page_width": page_width,
                "page_height": page_height,
                "section_count": len(sections),
                "block_count": len(blocks),
            }
        }

    def _empty_html(self) -> dict[str, Any]:
        """Return empty HTML structure."""
        return {
            "html": "<div>No content available</div>",
            "blocks": [],
            "metadata": {
                "page_width": 595.5,
                "page_height": 842.0,
                "section_count": 0,
                "block_count": 0,
            }
        }

    def _extract_section_blocks(
        self,
        section: dict[str, Any],
        source_text: str,
        anchors: list[dict[str, Any]]
    ) -> list[dict[str, Any]]:
        """
        Extract text blocks for a section with PDF coordinates.

        Strategy:
        1. Find section text in source_text
        2. Match with suggestion anchors for coordinates
        3. Create positioned blocks

        Args:
            section: NLP section result (type, text, entities)
            source_text: Full extracted text
            anchors: All suggestion anchors

        Returns:
            List of text blocks with position data
        """
        section_type = section.get("type", "other")
        section_text = section.get("text", "")

        if not section_text:
            return []

        # Find anchors that belong to this section
        section_anchors = self._filter_anchors_by_section(
            anchors,
            section_type,
            section_text
        )

        blocks = []
        for anchor in section_anchors:
            rect = anchor.get("rect", {})
            text_preview = anchor.get("text_preview", "")

            blocks.append({
                "id": anchor.get("suggestion_id", ""),
                "section_type": section_type,
                "text": text_preview,
                "position": {
                    "x": rect.get("x", 0),
                    "y": rect.get("y", 0),
                    "width": rect.get("w", 0),
                    "height": rect.get("h", 0),
                    "page": anchor.get("page_index", 0),
                },
                "suggestion_id": anchor.get("suggestion_id", ""),
            })

        # If no anchors found but section has text, create a default block
        if not blocks and section_text:
            blocks.append({
                "id": f"{section_type}_default",
                "section_type": section_type,
                "text": section_text[:500],  # Limit length for display
                "position": {
                    "x": 50,  # Default margin
                    "y": 100 + len(blocks) * 100,  # Stack vertically
                    "width": page_width - 100,
                    "height": 100,
                    "page": 0,
                },
                "suggestion_id": None,
            })

        return blocks

    def _filter_anchors_by_section(
        self,
        anchors: list[dict[str, Any]],
        section_type: str,
        section_text: str
    ) -> list[dict[str, Any]]:
        """Filter anchors that belong to a section based on text overlap."""
        section_anchors = []
        section_lower = section_text.lower()

        for anchor in anchors:
            text_preview = anchor.get("text_preview", "")
            # Check if this anchor's text appears in the section
            if text_preview.lower() in section_lower:
                section_anchors.append(anchor)

        return section_anchors

    def _generate_html(
        self,
        blocks: list[dict[str, Any]],
        page_width: float,
        page_height: float
    ) -> str:
        """
        Generate HTML string with positioned blocks.

        Uses absolute positioning to match PDF layout.
        """
        html_parts = ['<div class="pdf-page" style="']
        html_parts.append(f'  width: {page_width}px;')
        html_parts.append(f'  height: {page_height}px;')
        html_parts.append('  position: relative;')
        html_parts.append('  background: white;')
        html_parts.append('">')

        for block in blocks:
            pos = block["position"]
            section_type = block["section_type"]

            html_parts.append(f'  <div class="text-block" data-section="{section_type}" data-id="{block["id"]}" style="')
            html_parts.append(f'    position: absolute;')
            html_parts.append(f'    left: {pos["x"]}px;')
            html_parts.append(f'    top: {pos["y"]}px;')
            html_parts.append(f'    width: {pos["width"]}px;')
            html_parts.append(f'    height: {pos["height"]}px;')
            html_parts.append(f'    z-index: 10;')
            html_parts.append('">')
            html_parts.append(f'    <div class="editable-content" contenteditable="true">{block["text"]}</div>')
            html_parts.append('  </div>')

        html_parts.append('</div>')

        return "\n".join(html_parts)
