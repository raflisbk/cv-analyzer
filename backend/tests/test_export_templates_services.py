from io import BytesIO

import fitz
import pytest
from docx import Document

from app.services.export_templates.apply_fixes import apply_fixes
from app.services.export_templates.html_pdf import (
    extract_pdf_text,
    render_html,
    render_pdf,
)
from app.services.export_templates.original_docx import render_original_docx
from app.services.export_templates.original_pdf import render_original_pdf
from app.services.export_templates.registry import template_ats_score, template_list


@pytest.fixture
def document():
    return {
        "sections": [
            {"type": "experience", "content": "Kept line\nOld line\nLast line"}
        ]
    }


@pytest.fixture
def suggestions():
    return [
        {
            "section": "experience",
            "suggestions": [
                {"original_text": "Old line", "after_text": "New line"},
                {"original_text": "Last line", "after_text": "Better [metric]"},
            ],
        }
    ]


def test_registry_has_single_original():
    entries = template_list()
    assert [entry["id"] for entry in entries] == [
        "original",
        "classic",
        "modern",
        "compact",
        "plain",
    ]
    assert sum(entry["original"] for entry in entries) == 1
    assert entries[0]["atsScore"] is None
    assert set(entries[0]) == {
        "id",
        "name",
        "description",
        "atsScore",
        "original",
        "traits",
    }


def test_template_score_is_cached():
    template_ats_score.cache_clear()
    assert template_ats_score("plain") == template_ats_score("plain")
    assert template_ats_score.cache_info().hits == 1


def test_apply_fixes_subset(document, suggestions):
    result = apply_fixes(document, suggestions, ["experience_0_0"])
    assert result.document["sections"][0]["content"] == "Kept line\nNew line\nLast line"
    assert result.applied == ["experience_0_0"]
    assert document["sections"][0]["content"] == "Kept line\nOld line\nLast line"


def test_apply_fixes_default_skips_missing_answer(document, suggestions):
    result = apply_fixes(document, suggestions)
    assert result.applied == ["experience_0_0"]
    assert result.skipped == {"experience_1_0": "needs_input"}


def test_apply_fixes_with_answer(document, suggestions):
    result = apply_fixes(
        document, suggestions, answers={"experience_1_0": {"metric": "5 teams"}}
    )
    assert "Better 5 teams" in result.document["sections"][0]["content"]
    assert len(result.applied) == 2


def test_invalid_answer_is_skipped(document, suggestions):
    result = apply_fixes(
        document, suggestions, answers={"experience_1_0": {"metric": "bad\nvalue"}}
    )
    assert result.skipped["experience_1_0"] == "invalid_answer"
    assert "bad" not in result.document["sections"][0]["content"]


def test_html_escapes_answer(document, suggestions):
    result = apply_fixes(
        document, suggestions, answers={"experience_1_0": {"metric": "<script>"}}
    )
    html = render_html("plain", result.document)
    assert "<script>" not in html
    assert "&lt;script&gt;" in html


@pytest.mark.parametrize("template_id", ["classic", "modern", "compact", "plain"])
def test_template_pdf_preserves_reading_order(template_id):
    source = {
        "sections": [
            {"type": "header", "content": "Alex Morgan\nalex@example.com"},
            {"type": "experience", "content": "First role\nSecond role"},
        ]
    }
    text = extract_pdf_text(render_pdf(template_id, source))
    assert (
        text.index("Alex Morgan") < text.index("First role") < text.index("Second role")
    )
    assert "alex@example.com" in text


def test_html_escapes_inserted_text():
    html = render_html(
        "plain",
        {"sections": [{"type": "skills", "content": "<script>alert(1)</script>"}]},
    )
    assert "<script>" not in html
    assert "&lt;script&gt;" in html


def test_original_pdf_only_changes_fixed_line(document, suggestions):
    pdf = fitz.open()
    page = pdf.new_page()
    for index, line in enumerate(("Kept line", "Old line", "Last line")):
        page.insert_text((50, 50 + index * 20), line)
    original = pdf.tobytes()
    pdf.close()
    result = apply_fixes(document, suggestions, ["experience_0_0"], original=True)
    output = render_original_pdf(original, result)
    text = extract_pdf_text(output)
    before = extract_pdf_text(original).splitlines()
    after = text.splitlines()
    assert [line for line in before if line and line != "Old line"] == [
        line for line in after if line and line != "New line"
    ]
    assert "Kept line" in text
    assert "Last line" in text
    assert "New line" in text
    assert "Old line" not in text
    assert result.applied == ["experience_0_0"]


def test_original_pdf_no_room_keeps_source(document, suggestions):
    pdf = fitz.open()
    page = pdf.new_page()
    page.insert_text((50, 50), "Old line")
    source = pdf.tobytes()
    pdf.close()
    suggestions[0]["suggestions"][0][
        "after_text"
    ] = "A replacement much longer than the source line"
    result = apply_fixes(document, suggestions, ["experience_0_0"], original=True)
    output = render_original_pdf(source, result)
    assert "Old line" in extract_pdf_text(output)
    assert result.skipped == {"experience_0_0": "no_room"}


def test_original_docx_preserves_other_runs(document, suggestions):
    source = Document()
    paragraph = source.add_paragraph()
    kept = paragraph.add_run("Kept line ")
    kept.bold = True
    old = paragraph.add_run("Old line")
    old.italic = True
    paragraph.add_run(" Last line")
    stream = BytesIO()
    source.save(stream)
    result = apply_fixes(document, suggestions, ["experience_0_0"], original=True)
    output = Document(BytesIO(render_original_docx(stream.getvalue(), result)))
    runs = output.paragraphs[0].runs
    assert [run.text for run in runs] == ["Kept line ", "New line", " Last line"]
    assert runs[0].bold
    assert runs[1].italic


def test_original_pdf_changes_only_first_duplicate(document, suggestions):
    pdf = fitz.open()
    page = pdf.new_page()
    page.insert_text((50, 50), "Old line")
    page.insert_text((50, 80), "Old line")
    source = pdf.tobytes()
    pdf.close()
    result = apply_fixes(document, suggestions, ["experience_0_0"], original=True)
    text = extract_pdf_text(render_original_pdf(source, result))
    assert text.count("New line") == 1
    assert text.count("Old line") == 1
