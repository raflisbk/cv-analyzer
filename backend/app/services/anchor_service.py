"""
Anchor computation service using PyMuPDF (fitz).
Phase 14: Pre-compute PDF bounding rects for suggestion anchors (ANNOT-04, D-02).
Called from llm_suggest_task after suggestions are saved.

PyMuPDF coordinate system: top-left origin, y increases downward (CSS-compatible).
No coordinate flip needed — rects from search_for() are directly CSS-compatible.
"""

import logging

import fitz  # PyMuPDF

from app.services.storage import storage_service


logger = logging.getLogger(__name__)


def compute_suggestion_anchors(file_id: str, suggestions: list[dict]) -> list[dict]:
    """
    Download PDF from R2 and compute anchor rects for each suggestion with original_text.

    Args:
        file_id: R2 object key (job.file_id)
        suggestions: list[SuggestionCard] dicts from JSONB

    Returns:
        list[SuggestionAnchorRecord dicts] for JSONB storage.
        Returns [] on any failure (graceful degradation — no anchors is non-fatal).
    """
    try:
        pdf_bytes = storage_service.get_file(file_id)
    except Exception as e:
        logger.warning(
            "anchor_service: R2 file not available, skipping anchors",
            extra={"file_id": file_id, "error": str(e)},
        )
        return []

    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    except Exception as e:
        logger.warning(
            "anchor_service: failed to open PDF with PyMuPDF",
            extra={"file_id": file_id, "error": str(e)},
        )
        return []

    anchors: list[dict] = []

    for card_idx, card in enumerate(suggestions):
        section = card.get("section", "unknown")
        for item_idx, item in enumerate(card.get("suggestions", [])):
            # Use original_text[:100] as anchor phrase; fall back to text[:60]
            raw_anchor = (item.get("original_text") or item.get("text", ""))[
                :100
            ].strip()
            if not raw_anchor:
                continue

            for page_idx in range(len(doc)):
                page = doc[page_idx]
                rects = page.search_for(raw_anchor)  # case-insensitive by default
                if not rects:
                    # Try shorter truncation to improve match probability
                    short_anchor = raw_anchor[:60].strip()
                    rects = page.search_for(short_anchor)
                if rects:
                    r = rects[0]
                    anchors.append(
                        {
                            "suggestion_id": f"{section}_{item_idx}_{card_idx}",
                            "section": section,
                            "text_anchor": raw_anchor,
                            "page_index": page_idx,
                            "rect": {
                                "x": r.x0,
                                "y": r.y0,
                                "w": r.x1 - r.x0,
                                "h": r.y1 - r.y0,
                            },
                            "priority": item.get("priority", "quick_win"),
                        }
                    )
                    break  # First matching page only

    doc.close()
    logger.info(
        "anchor_service: computed anchors",
        extra={"file_id": file_id, "anchor_count": len(anchors)},
    )
    return anchors
