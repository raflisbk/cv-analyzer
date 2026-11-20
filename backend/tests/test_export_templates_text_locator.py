from io import BytesIO

import fitz
import pytest
from docx import Document

from app.services.export_templates.apply_fixes import apply_fixes
from app.services.export_templates.html_pdf import extract_pdf_text
from app.services.export_templates.original_docx import render_original_docx
from app.services.export_templates.original_pdf import render_original_pdf


@pytest.fixture
def cv_pdf():
    document = fitz.open()
    page = document.new_page()
    lines = (
        "Alex Morgan",
        "Business Analyst",
        "alex@example.com",
        "SUMMARY",
        "Analyst with four years of experience in e-commerce reporting and dashboards.",
        "EXPERIENCE",
        "- Built weekly reports for sales teams.",
        "- Improved  dashboard accuracy by 20%.",
        '- Presented "weekly" insights to business leaders.',
        "- Documented repeatable data",
        "workflows.",
        "EDUCATION",
        "BS Business Analytics, State University",
        "SKILLS",
        "Python, SQL, Tableau, Excel, reporting, communication",
    )
    for index, line in enumerate(lines):
        page.insert_text((50, 40 + index * 34), line)
    source = document.tobytes()
    document.close()
    return source


def _export_pdf(source, original, replacement="Updated relevant text"):
    suggestions = [
        {
            "section": "summary",
            "suggestions": [{"original_text": original, "after_text": replacement}],
        }
    ]
    result = apply_fixes({}, suggestions, original=True)
    output = extract_pdf_text(render_original_pdf(source, result))
    return output, result


@pytest.mark.parametrize(
    ("original", "touched"),
    [
        (
            "Analyst  with four years of experience in e-commerce reporting and dashboards.",
            (
                "Analyst with four years of experience in e-commerce reporting and dashboards.",
            ),
        ),
        (
            "Analyst with four years of experience in e-commerce reporting and dashboards",
            (
                "Analyst with four years of experience in e-commerce reporting and dashboards.",
            ),
        ),
        (
            "- Built weekly reports for sales teams.",
            ("- Built weekly reports for sales teams.",),
        ),
        (
            "• Built weekly reports for sales teams.",
            ("- Built weekly reports for sales teams.",),
        ),
        (
            "- Improved dashboard accuracy by 20%.",
            ("- Improved dashboard accuracy by 20%.",),
        ),
        (
            "Analyst with four years of experience in e–commerce reporting and dashboards.",
            (
                "Analyst with four years of experience in e-commerce reporting and dashboards.",
            ),
        ),
        (
            "Analyst with four years of experience in e-commerce\nreporting and dashboards.",
            (
                "Analyst with four years of experience in e-commerce reporting and dashboards.",
            ),
        ),
        (
            "- Presented “weekly” insights to business leaders.",
            ('- Presented "weekly" insights to business leaders.',),
        ),
        (
            "Documented repeatable data workflows.",
            ("- Documented repeatable data", "workflows."),
        ),
        (
            "SKILLS: Python, SQL, Tableau, Excel, reporting, communication",
            ("SKILLS", "Python, SQL, Tableau, Excel, reporting, communication"),
        ),
    ],
)
def test_pdf_replaces_normalized_original_without_changing_other_lines(
    cv_pdf, original, touched
):
    before = extract_pdf_text(cv_pdf).splitlines()
    output, result = _export_pdf(cv_pdf, original)
    after = output.splitlines()
    assert result.applied == ["summary_0_0"]
    assert result.skipped == {}
    assert "Updated relevant text" in output
    assert "Alex Morgan" in output
    assert "BS Business Analytics, State University" in output
    assert [line for line in before if line and line not in touched] == [
        line for line in after if line and "Updated relevant text" not in line
    ]


@pytest.mark.parametrize(
    "original",
    [
        "Analyst with five years of experience in e-commerce reporting and dashboards.",
        "This sentence is absent from the CV.",
    ],
)
def test_pdf_skips_unmatched_text_without_changing_cv(cv_pdf, original):
    output, result = _export_pdf(cv_pdf, original)
    assert output == extract_pdf_text(cv_pdf)
    assert result.applied == []
    assert result.skipped == {"summary_0_0": "text_not_found"}


def test_docx_replaces_normalized_text_across_runs():
    source = Document()
    paragraph = source.add_paragraph()
    paragraph.add_run("Keep ")
    paragraph.add_run("Analyst with four years")
    paragraph.add_run(" of experience.")
    paragraph.add_run(" Keep this")
    stream = BytesIO()
    source.save(stream)
    suggestions = [
        {
            "section": "summary",
            "suggestions": [
                {
                    "original_text": "Analyst  with four years of experience",
                    "after_text": "Experienced analyst.",
                }
            ],
        }
    ]
    result = apply_fixes({}, suggestions, original=True)
    output = Document(BytesIO(render_original_docx(stream.getvalue(), result)))
    assert output.paragraphs[0].text == "Keep Experienced analyst. Keep this"
    assert result.applied == ["summary_0_0"]
