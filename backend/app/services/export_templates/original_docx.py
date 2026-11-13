from io import BytesIO

from docx import Document
from docx.document import Document as DocumentType

from app.services.export_templates.apply_fixes import Fix, FixResult


def _paragraphs(document: DocumentType):
    yield from document.paragraphs
    for table in document.tables:
        for row in table.rows:
            for cell in row.cells:
                yield from cell.paragraphs


def _replace_runs(paragraph, fix: Fix) -> bool:
    start = paragraph.text.find(fix.original)
    if start < 0:
        return False
    stop = start + len(fix.original)
    position = 0
    inserted = False
    for run in paragraph.runs:
        text = run.text
        end = position + len(text)
        left = max(0, start - position)
        right = min(len(text), stop - position)
        if left < right:
            prefix = text[:left]
            suffix = text[right:]
            run.text = prefix + (fix.replacement if not inserted else "") + suffix
            inserted = True
        position = end
    return inserted


def render_original_docx(data: bytes, result: FixResult) -> bytes:
    document = Document(BytesIO(data))
    for fix in result.fixes:
        if not any(
            _replace_runs(paragraph, fix) for paragraph in _paragraphs(document)
        ):
            result.skipped[fix.id] = "text_not_found"
            result.applied.remove(fix.id)
    output = BytesIO()
    document.save(output)
    return output.getvalue()
