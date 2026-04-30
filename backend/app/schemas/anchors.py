"""
Pydantic schemas for suggestion anchor coordinates.
Stored as JSONB in jobs.suggestion_anchors column.
"""

from pydantic import BaseModel


class AnchorRect(BaseModel):
    """Bounding rect in PDF points (top-left origin, y-down — CSS-compatible)."""

    x: float
    y: float
    w: float
    h: float


class SuggestionAnchorRecord(BaseModel):
    """
    Maps one SuggestionItem to a bounding rect on a specific PDF page.
    suggestion_id is deterministic: "{section}_{item_idx}_{card_idx}".
    """

    suggestion_id: str
    section: str
    text_anchor: str  # original_text substring used to find rect
    page_index: int  # 0-indexed
    rect: AnchorRect
    priority: str = "quick_win"  # mirrors SuggestionItem.priority
