import json

from app.services.llm.suggestions_parse import parse_suggestions

QC_BULLET = (
    "Deployed YOLOv12-based QC System for strobel printing, "
    "reducing defect rates significantly"
)
ROLE_LINE = "PT. Pratama Abadi Industri - QA Engineer, August 2024 - Nov"
PROJECT_LINE = "Resume-analysis platform with LLM scoring and Tiptap editor"
CV_TEXT = f"EXPERIENCE\n- {QC_BULLET}\n{ROLE_LINE}\n{PROJECT_LINE}\n"


def _parse(item: dict):
    raw = json.dumps(
        {"suggestions": [{"section": "Experience", "suggestions": [item]}]}
    )
    return parse_suggestions(raw, CV_TEXT).suggestions[0].suggestions[0]


def _item(text: str, original: str | None, **extra):
    return {
        "priority": "high_impact",
        "text": text,
        "explanation": "",
        "type": "impact_metric",
        "original_text": original,
        "after_text": None,
        **extra,
    }


def test_null_metric_rewrite_gets_percent_placeholder():
    item = _parse(_item("Quantify the defect-rate reduction.", QC_BULLET))

    assert item.after_text.endswith("reducing defect rates by [%]")
    assert [n.token for n in item.needs_input] == ["[%]"]


def test_null_date_rewrite_gets_year_placeholder():
    item = _parse(
        _item(
            "Complete the end date for the PT. Pratama role.",
            ROLE_LINE,
            type="missing_section",
        )
    )

    assert item.after_text == f"{ROLE_LINE} [year]"
    assert [n.token for n in item.needs_input] == ["[year]"]


def test_null_project_name_rewrite_gets_name_placeholder():
    item = _parse(
        _item(
            "Add a project heading and project name for the platform.",
            PROJECT_LINE,
            type="missing_section",
        )
    )

    assert item.after_text == f"[project name]: {PROJECT_LINE}"
    assert [n.token for n in item.needs_input] == ["[project name]"]


def test_unknown_percent_placeholder_is_normalised_not_dropped():
    item = _parse(
        _item(
            "Quantify the reduction.",
            QC_BULLET,
            after_text=QC_BULLET.replace("significantly", "by [X%]"),
        )
    )

    assert item.after_text.endswith("by [%]")
    assert [n.token for n in item.needs_input] == ["[%]"]


def test_invented_number_is_still_rejected():
    item = _parse(
        _item(
            "Quantify the reduction.",
            QC_BULLET,
            after_text="Deployed QC System, reducing defect rates by 40 widgets",
        )
    )

    assert item.after_text is None or "40" not in item.after_text


def test_missing_section_without_original_stays_null():
    item = _parse(_item("Add a Certifications section.", None, type="missing_section"))

    assert item.after_text is None
    assert item.needs_input == []


def test_original_not_in_cv_is_not_rewritten():
    item = _parse(_item("Quantify the result.", "Something the CV never says"))

    assert item.after_text is None
