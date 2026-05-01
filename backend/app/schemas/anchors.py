from pydantic import BaseModel


class AnchorRect(BaseModel):

    x: float
    y: float
    w: float
    h: float


class SuggestionAnchorRecord(BaseModel):

    suggestion_id: str
    section: str
    text_anchor: str
    page_index: int
    rect: AnchorRect
    priority: str = "quick_win"
