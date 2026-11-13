from dataclasses import dataclass

import fitz

MIN_VISIBLE_FONT_SIZE = 4.0
NEAR_WHITE_CHANNEL = 245
MAX_SNIPPETS = 5
MAX_SNIPPET_LENGTH = 80


@dataclass
class HiddenTextReport:
    count: int
    snippets: list[str]


def _hidden(span: dict, page_rect: fitz.Rect) -> bool:
    color = int(span.get("color", 0))
    near_white = all(
        (color >> shift) & 255 >= NEAR_WHITE_CHANNEL for shift in (16, 8, 0)
    )
    bounds = fitz.Rect(span["bbox"])
    clipped = bounds.is_empty or not page_rect.contains(bounds)
    invisible = span.get("render_mode") == 3 or span.get("alpha", 255) == 0
    return near_white or span["size"] < MIN_VISIBLE_FONT_SIZE or clipped or invisible


def detect_hidden_text(pdf_bytes: bytes) -> HiddenTextReport:
    count = 0
    snippets: list[str] = []
    with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
        for page in doc:
            for block in page.get_text("dict", clip=fitz.INFINITE_RECT())["blocks"]:
                for line in block.get("lines", []):
                    for span in line.get("spans", []):
                        snippet = span.get("text", "").strip()
                        if snippet and _hidden(span, page.rect):
                            count += 1
                            if len(snippets) < MAX_SNIPPETS:
                                snippets.append(snippet[:MAX_SNIPPET_LENGTH])
    return HiddenTextReport(count, snippets)
