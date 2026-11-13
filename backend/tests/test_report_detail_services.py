import uuid
from datetime import UTC, datetime

import pytest

from app.models.job import Job
from app.services.report_detail.assemble import report_detail
from app.services.report_detail.bullets import bullet_view
from app.services.report_detail.fixes import WEIGHTS, fixes
from app.services.report_detail.sections import section_score
from app.services.versions_view.chain import versions
from app.services.versions_view.diff import version_diff


def make_job(*, parent=None, score=70, text="CV text", suggestions=None):
    job = Job(
        id=uuid.uuid4(),
        file_id="file",
        parent_job_id=parent,
        file_metadata={"filename": "cv.pdf", "pages": 1},
        result={"text": text},
        scores={
            "overall": score,
            "impact": 60,
            "clarity": 80,
            "relevance": 70,
            "completeness": 90,
            "benchmark": {"percentile": 65},
            "metrics": {
                "bullet_count": 2,
                "quantification_ratio": 0.5,
                "action_verb_ratio": {"strong": 1},
                "section_coverage": {"found": ["experience"], "missing": ["skills"]},
            },
        },
        nlp_result={
            "sections": [
                {"type": "experience", "text": "Acme\n- Built 3 tools for teams"}
            ],
            "skills": ["tools"],
        },
        suggestions=suggestions or [],
    )
    job.updated_at = datetime(2026, 11, 14, tzinfo=UTC)
    return job


def test_weights_sum_to_100():
    assert sum(WEIGHTS.values()) == 100


def test_fixes_and_projection_use_weighted_room_to_improve():
    job = make_job(
        suggestions=[
            {
                "suggestions": [
                    {"text": "Add measured result", "type": "impact_metric"},
                    {"text": "Show a second result", "type": "impact_metric"},
                    {"text": "Use a stronger verb", "type": "action_verb"},
                ]
            }
        ]
    )
    changes, gains = fixes(job)
    assert [fix.points for fix in changes] == [7, 7, 6]
    assert gains == {"impact": 14, "clarity": 6, "relevance": 0, "completeness": 0}
    assert report_detail(job, {job.id: job}).projected_score == 90


@pytest.mark.parametrize(
    ("text", "expected"),
    [
        ("", 0),
        ("one two three four five", 4),
        (
            " ".join(["word"] * 50)
            + "\n- Built 3 tools\n- Led 4 teams\n- Saved 5 hours",
            100,
        ),
    ],
)
def test_section_score_rubric(text, expected):
    assert section_score(text) == expected


@pytest.mark.parametrize(
    ("text", "expected"),
    [
        ("Helped with work", "weak"),
        ("Built a useful tool for many teams", "fair"),
        ("Built 3 useful tools for multiple teams", "strong"),
    ],
)
def test_bullet_strength_rules(text, expected):
    assert bullet_view(text, "Acme").strength == expected


def test_first_version_has_no_delta_and_same_previous_score():
    job = make_job()
    assert versions(job, {job.id: job})[0].delta is None
    report = report_detail(job, {job.id: job})
    assert report.previous_score == 70
    assert all(item.previous == item.score for item in report.dimensions)


def test_report_uses_immediate_parent_scores():
    first = make_job(score=52)
    second = make_job(parent=first.id, score=68)
    third = make_job(parent=second.id, score=81)
    second.scores.update(impact=65, clarity=68, relevance=70, completeness=70)
    third.scores.update(impact=78, clarity=82, relevance=84, completeness=82)
    report = report_detail(third, {item.id: item for item in (first, second, third)})
    assert report.previous_score == 68
    assert {item.key: item.previous for item in report.dimensions} == {
        "impact": 65,
        "clarity": 68,
        "relevance": 70,
        "completeness": 70,
    }


def test_report_parent_without_scores_falls_back_to_current_scores():
    first = make_job()
    first.scores = None
    second = make_job(parent=first.id, score=81)
    report = report_detail(second, {first.id: first, second.id: second})
    assert report.previous_score == 81
    assert all(item.previous == item.score for item in report.dimensions)


def test_versions_are_oldest_first_with_labels_and_requested_current():
    first = make_job(score=60)
    second = make_job(parent=first.id, score=70)
    third = make_job(parent=second.id, score=80)
    history = versions(third, {item.id: item for item in (first, second, third)})
    assert [(item.label, item.delta, item.current) for item in history] == [
        ("v1", None, False),
        ("v2", 10, False),
        ("v3", 10, True),
    ]


def test_diff_uses_previous_text_and_empty_first_before():
    first = make_job(text="old paragraph")
    second = make_job(parent=first.id, text="new paragraph")
    assert version_diff(second, first).model_dump() == {
        "before": "old paragraph",
        "after": "new paragraph",
    }
    assert version_diff(first, None).before == ""


def test_large_diff_contains_only_changed_paragraphs():
    shared = "same paragraph" * 1000
    first = make_job(text=shared + "\n\nold")
    second = make_job(text=shared + "\n\nnew")
    assert version_diff(second, first).model_dump() == {"before": "old", "after": "new"}


def test_empty_optional_data_produces_valid_report():
    job = make_job()
    job.suggestions = None
    job.nlp_result = None
    data = report_detail(job, {job.id: job})
    assert data.fixes == []
    assert data.sections == []
    assert data.bullets == []
    assert data.previous_score == data.score
