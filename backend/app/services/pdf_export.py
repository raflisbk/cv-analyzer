from typing import Any

from weasyprint import CSS, HTML
from weasyprint.text.fonts import FontConfiguration

from app.core.logging import structured_logger as logger


class PDFExportService:
    def __init__(self) -> None:
        self.font_config = FontConfiguration()

    def export_html_to_pdf(
        self,
        html_content: str,
        metadata: dict[str, Any] | None = None,
    ) -> bytes:
        try:
            logger.info("pdf_export_starting", content_length=len(html_content))

            full_html = self._build_html_document(html_content, metadata)

            css_styles = self._get_cv_css()

            html_doc = HTML(
                string=full_html,
                base_url="",
                font_config=self.font_config,
            )

            pdf_bytes = html_doc.write_pdf(
                stylesheets=[CSS(string=css_styles)],
                font_config=self.font_config,
            )

            logger.info("pdf_export_generated", pdf_size=len(pdf_bytes))

            return pdf_bytes

        except Exception as e:
            logger.error("pdf_export_failed", error=str(e), exc_info=True)
            raise

    def _build_html_document(
        self, content: str, metadata: dict[str, Any] | None
    ) -> str:
        title = metadata.get("title", "CV Document") if metadata else "CV Document"
        author = metadata.get("author", "") if metadata else ""

        return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    {f'<meta name="author" content="{author}">' if author else ''}
</head>
<body>
    <div class="cv-container">
        {content}
    </div>
</body>
</html>"""

    def _get_cv_css(self) -> str:
        return """
        @page {
            size: A4;
            margin: 2cm 1.5cm;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 11pt;
            line-height: 1.5;
            color: #1a1a1a;
            background: #ffffff;
        }

        .cv-container {
            max-width: 100%;
            margin: 0 auto;
        }

        h1 {
            font-size: 18pt;
            font-weight: 700;
            margin-bottom: 0.3em;
            color: #111;
            border-bottom: 2px solid #CAFF43;
            padding-bottom: 0.2em;
        }

        h2 {
            font-size: 14pt;
            font-weight: 600;
            margin-top: 1em;
            margin-bottom: 0.5em;
            color: #333;
        }

        h3 {
            font-size: 12pt;
            font-weight: 600;
            margin-top: 0.8em;
            margin-bottom: 0.3em;
            color: #444;
        }

        p {
            margin-bottom: 0.5em;
            text-align: justify;
        }

        ul, ol {
            margin-left: 1.5em;
            margin-bottom: 0.5em;
        }

        li {
            margin-bottom: 0.2em;
        }

        strong, b {
            font-weight: 600;
        }

        em, i {
            font-style: italic;
        }

        u {
            text-decoration: underline;
        }

        a {
            color: #0066cc;
            text-decoration: none;
        }

        a:hover {
            text-decoration: underline;
        }

        .suggestion-highlight {
            background: none !important;
            border-bottom: none !important;
            padding: 0 !important;
        }

        .page-break {
            page-break-before: always;
        }

        p, li {
            orphans: 3;
            widows: 3;
        }

        h1, h2, h3 {
            page-break-after: avoid;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 1em;
        }

        th, td {
            padding: 0.5em;
            border: 1px solid #ddd;
            text-align: left;
        }

        th {
            background: #f5f5f5;
            font-weight: 600;
        }
        """
