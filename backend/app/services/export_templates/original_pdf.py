import fitz

from app.services.export_templates.apply_fixes import Fix, FixResult


def _rectangles(page: fitz.Page, source: str) -> list[fitz.Rect]:
    rectangles = page.search_for(source)
    if rectangles:
        return rectangles
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
) -> tuple[list[fitz.Rect], float, tuple] | None:
    rectangles = _rectangles(page, fix.original)
    if not rectangles:
        return None
    size, color = _style(page, rectangles[0])
    target = rectangles[0]
    width = target.width
    for scale in (1.0, 0.95, 0.9, 0.85, 0.8):
        current = size * scale
        if (
            fitz.get_text_length(fix.replacement, fontname="helv", fontsize=current)
            <= width
        ):
            return rectangles, current, color
    return rectangles, 0.0, color


def render_original_pdf(data: bytes, result: FixResult) -> bytes:
    with fitz.open(stream=data, filetype="pdf") as document:
        for fix in result.fixes[:]:
            found = False
            for page in document:
                placement = _placement(page, fix)
                if placement is None:
                    continue
                found = True
                rects, size, color = placement
                if not size:
                    result.skipped[fix.id] = "no_room"
                    break
                baseline = rects[0].y1 - max(1, rects[0].height * 0.18)
                for rect in rects:
                    page.add_redact_annot(rect, fill=(1, 1, 1))
                page.apply_redactions(images=0, graphics=0)
                page.insert_text(
                    (rects[0].x0, baseline),
                    fix.replacement,
                    fontname="helv",
                    fontsize=size,
                    color=color,
                )
                break
            if not found:
                result.skipped[fix.id] = "text_not_found"
            if fix.id in result.skipped:
                result.applied.remove(fix.id)
        return document.tobytes(garbage=4, deflate=True)
