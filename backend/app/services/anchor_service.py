import fitz
from loguru import logger

from app.services.storage import storage_service


def compute_suggestion_anchors(file_id: str, suggestions: list[dict]) -> list[dict]:
    try:
        pdf_bytes = storage_service.get_file(file_id)
    except Exception as e:
        logger.warning("anchor_r2_unavailable", file_id=file_id, error=str(e))
        return []

    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    except Exception as e:
        logger.warning("anchor_pdf_open_failed", file_id=file_id, error=str(e))
        return []

    anchors: list[dict] = []
    seen_positions: set[tuple[int, int, float, float, float, float]] = set()

    for card_idx, card in enumerate(suggestions):
        section = card.get("section", "unknown")
        for item_idx, item in enumerate(card.get("suggestions", [])):
            raw_anchor = (item.get("original_text") or item.get("text", ""))[
                :100
            ].strip()
            if not raw_anchor:
                logger.debug(
                    "anchor_skip_no_text",
                    suggestion_id=f"{section}_{item_idx}_{card_idx}",
                )
                continue

            anchor_found = False

            for page_idx in range(len(doc)):
                if anchor_found:
                    break

                page = doc[page_idx]

                rects = page.search_for(raw_anchor)
                if rects:
                    anchor_found = True
                else:
                    short_anchor = raw_anchor[:60].strip()
                    rects = page.search_for(short_anchor)
                    if rects:
                        anchor_found = True
                    else:
                        normalized_anchor = " ".join(raw_anchor[:40].split())
                        if len(normalized_anchor) > 10:
                            rects = page.search_for(normalized_anchor)
                            if rects:
                                anchor_found = True

                if rects:
                    r = rects[0]
                    pos_key = (
                        page_idx,
                        round(r.x0, 1),
                        round(r.y0, 1),
                        round(r.x1, 1),
                        round(r.y1, 1),
                    )
                    if pos_key in seen_positions:
                        logger.debug(
                            "anchor_skip_duplicate",
                            suggestion_id=f"{section}_{item_idx}_{card_idx}",
                            page=page_idx,
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
                    break

            if not anchor_found:
                logger.debug(
                    "anchor_no_match",
                    suggestion_id=f"{section}_{item_idx}_{card_idx}",
                )

    doc.close()
    logger.info("anchors_computed", file_id=file_id, anchor_count=len(anchors))
    return anchors
