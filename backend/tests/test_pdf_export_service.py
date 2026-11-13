from app.services.pdf_export import PDFExportService


def test_html_export_returns_real_pdf():
    result = PDFExportService().export_html_to_pdf("<h1>Fictional CV</h1>")
    assert result.startswith(b"%PDF")
