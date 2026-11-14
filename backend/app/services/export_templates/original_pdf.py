import fitz

from app.services.export_templates.apply_fixes import Fix, FixResult


def _rectangles(page: fitz.Page, source: str) -> list[fitz.Rect]:
    rectangles = page.search_for(source)
    if rectangles:
        selected = []
        target = " ".join(source.split())
        for rect in rectangles:
            selected.append(rect)
            found = " ".join(
                " ".join(page.get_textbox(item) for item in selected).split()
            )
            if found == target:
                break
        return selected
    lines = [line.strip() for line in source.splitlines() if line.strip()]
    if len(lines) < 2:
        return []
    groups = [page.search_for(line) for line in lines]
    if any(not group for group in groups):
        return []
    return [group[0] for group in groups]


def _style(
    page: fitz.Page, rect: fitz.Rect
) -> tuple[float, tuple[float, float, float]]:
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            for span in line.get("spans", []):
                if fitz.Rect(span["bbox"]).intersects(rect):
                    color = span["color"]
                    return span["size"], (
                        (color >> 16 & 255) / 255,
                        (color >> 8 & 255) / 255,
                        (color & 255) / 255,
                    )
    return 11.0, (0.0, 0.0, 0.0)


def _placement(
    page: fitz.Page, fix: Fix
) -> tuple[list[fitz.Rect], fitz.Shape | None] | None:
    rectangles = _rectangles(page, fix.original)
    if not rectangles:
        return None
    size, color = _style(page, rectangles[0])
    target = rectangles[0]
    blocks = [fitz.Rect(block[:4]) for block in page.get_text("blocks")]
    right = max(
        max((block.x1 for block in blocks), default=target.x1),
        page.rect.width - target.x0,
    )
    lines = [
        fitz.Rect(line["bbox"])
        for block in page.get_text("dict")["blocks"]
        for line in block.get("lines", [])
    ]
    below = [
        rect.y0
        for rect in blocks + lines
        if rect.y0 > target.y0 and rect.y1 > max(r.y1 for r in rectangles)
    ]
    bottom = min(below) - 4 if below else page.rect.y1 - 4
    box = fitz.Rect(target.x0, target.y0, right, bottom)
    for scale in (1.0, 0.95, 0.9, 0.85, 0.8):
        current = size * scale
        if box.width <= 0 or box.height <= 0:
            break
        shape = page.new_shape()
        if (
            shape.insert_textbox(
                box, fix.replacement, fontname="helv", fontsize=current, color=color
            )
            >= 0
        ):
            return rectangles, shape
    return rectangles, None


def render_original_pdf(data: bytes, result: FixResult) -> bytes:
    with fitz.open(stream=data, filetype="pdf") as document:
        for fix in result.fixes[:]:
            found = False
            for page in document:
                placement = _placement(page, fix)
                if placement is None:
                    continue
                found = True
                rects, shape = placement
                if shape is None:
                    result.skipped[fix.id] = "no_room"
                    break
                for rect in rects:
                    page.add_redact_annot(rect, fill=(1, 1, 1))
                page.apply_redactions(images=0, graphics=0)
                shape.commit()
                break
            if not found:
                result.skipped[fix.id] = "text_not_found"
            if fix.id in result.skipped:
                result.applied.remove(fix.id)
        return document.tobytes(garbage=4, deflate=True)
