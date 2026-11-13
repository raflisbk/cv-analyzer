import fitz

from app.services.ats.hidden_text import detect_hidden_text
from app.services.ats.hidden_text_check import hidden_text_check
from app.services.ats.checker import compute_ats_score


def _pdf(*items):
    doc = fitz.open()
    page = doc.new_page()
    for text, size, color, point in items:
        page.insert_text(point, text, fontsize=size, color=color)
    result = doc.tobytes()
    doc.close()
    return result


def test_normal_text_not_flagged():
    report = detect_hidden_text(_pdf(("Visible", 12, (0, 0, 0), (72, 72))))
    assert report.count == 0


def test_white_text_flagged():
    report = detect_hidden_text(_pdf(("Hidden", 12, (1, 1, 1), (72, 72))))
    assert report.count == 1
    assert report.snippets == ["Hidden"]


def test_tiny_text_flagged():
    report = detect_hidden_text(_pdf(("Tiny", 1, (0, 0, 0), (72, 72))))
    assert report.count == 1


def test_off_page_text_flagged():
    report = detect_hidden_text(_pdf(("Off page", 12, (0, 0, 0), (600, 72))))
    assert report.snippets == ["Off page"]


def test_invisible_render_mode_flagged():
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), "Invisible", render_mode=3)
    report = detect_hidden_text(doc.tobytes())
    doc.close()
    assert report.snippets == ["Invisible"]


def test_mixed_text_counts_and_truncates():
    report = detect_hidden_text(
        _pdf(
            ("Visible", 12, (0, 0, 0), (72, 72)),
            ("X" * 100, 6, (1, 1, 1), (72, 100)),
            ("Tiny", 1, (0, 0, 0), (72, 120)),
        )
    )
    assert report.count == 2
    assert len(report.snippets[0]) == 80


def test_snippets_are_limited_to_five():
    items = [(f"Hidden {n}", 12, (1, 1, 1), (72, 72 + n * 24)) for n in range(6)]
    report = detect_hidden_text(_pdf(*items))
    assert report.count == 6
    assert len(report.snippets) == 5


def test_ats_check_shape():
    report = detect_hidden_text(_pdf(("Hidden", 12, (1, 1, 1), (72, 72))))
    assert hidden_text_check({"count": report.count, "snippets": report.snippets}) == {
        "check": "No hidden text",
        "status": "fail",
        "detail": "1 hidden text span: Hidden",
    }


def test_failed_hidden_check_lowers_ats_score():
    base = [{"check": "No tables detected", "status": "pass", "detail": ""}]
    failed = hidden_text_check({"count": 1, "snippets": ["Hidden"]})
    passed = hidden_text_check({"count": 0, "snippets": []})
    assert compute_ats_score([*base, failed]) < compute_ats_score([*base, passed])
