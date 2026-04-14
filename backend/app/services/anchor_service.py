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
    seen_positions: set[tuple[int, int, float, float, float, float]] = set()

    for card_idx, card in enumerate(suggestions):
        section = card.get("section", "unknown")
        for item_idx, item in enumerate(card.get("suggestions", [])):
            # Use original_text[:100] as anchor phrase; fall back to text[:60]
            raw_anchor = (item.get("original_text") or item.get("text", ""))[
                :100
            ].strip()
            if not raw_anchor:
                logger.debug(
                    "anchor_service: skipping suggestion without original_text",
                    extra={
                        "suggestion_id": f"{section}_{item_idx}_{card_idx}",
                        "text_preview": item.get("text", "")[:50],
                    },
                )
                continue

            # Try multiple search strategies with increasing tolerance
            anchor_found = False

            for page_idx in range(len(doc)):
                if anchor_found:
                    break

                page = doc[page_idx]

                # Strategy 1: Exact match
                rects = page.search_for(raw_anchor)
                if rects:
                    anchor_found = True
                else:
                    # Strategy 2: Shorter substring (first 60 chars)
                    short_anchor = raw_anchor[:60].strip()
                    rects = page.search_for(short_anchor)
                    if rects:
                        anchor_found = True
                    else:
                        # Strategy 3: Whitespace-normalized substring (first 40 chars)
                        # Remove extra whitespace and newlines for more lenient matching
                        normalized_anchor = " ".join(raw_anchor[:40].split())
                        if len(normalized_anchor) > 10:  # Only if meaningful
                            rects = page.search_for(normalized_anchor)
                            if rects:
                                anchor_found = True

                if rects:
                    r = rects[0]
                    # Deduplicate by position (page + rect coordinates)
                    # Round coordinates to avoid floating point differences
                    pos_key = (
                        page_idx,
                        round(r.x0, 1),
                        round(r.y0, 1),
                        round(r.x1, 1),
                        round(r.y1, 1),
                    )
                    if pos_key in seen_positions:
                        # Skip duplicate anchor at this position
                        logger.debug(
                            "anchor_service: skipping duplicate anchor position",
                            extra={
                                "suggestion_id": f"{section}_{item_idx}_{card_idx}",
                                "page": page_idx,
                                "rect": pos_key,
                            },
                        )
                        break

                    seen_positions.add(pos_key)
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

            # Log if no match found after all strategies
            if not anchor_found:
                logger.debug(
                    "anchor_service: no match found for suggestion after all strategies",
                    extra={
                        "suggestion_id": f"{section}_{item_idx}_{card_idx}",
                        "anchor_preview": raw_anchor[:50],
                    },
                )

    doc.close()
    logger.info(
        "anchor_service: computed anchors",
        extra={"file_id": file_id, "anchor_count": len(anchors)},
    )
    return anchors
