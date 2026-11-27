import pytest

from app.services.versions_view.chain import versions
from tests.test_report_detail_services import make_job


def chain_summaries(*overrides):
    jobs = [make_job(score=60)]
    for score, dimensions in overrides:
        child = make_job(parent=jobs[-1].id, score=score)
        child.scores.update(dimensions)
        jobs.append(child)
    return versions(jobs[0], {item.id: item for item in jobs})


def test_first_version_summary_is_first_without_dimension():
    first = chain_summaries()[0]
    assert (first.summary_kind, first.changed_dimension, first.changed_delta) == (
        "first",
        None,
        None,
    )
    assert first.summary == "First analysis."


def test_unchanged_dimensions_report_unchanged():
    second = chain_summaries((65, {}))[1]
    assert (second.summary_kind, second.changed_dimension, second.changed_delta) == (
        "unchanged",
        None,
        None,
    )
    assert second.summary == "No dimension changed."


def test_positive_dimension_change_is_reported():
    second = chain_summaries((65, {"impact": 63}))[1]
    assert (second.summary_kind, second.changed_dimension, second.changed_delta) == (
        "changed",
        "impact",
        3,
    )
    assert second.summary == "Score +5; impact +3."


def test_negative_dimension_change_is_reported():
    second = chain_summaries((55, {"clarity": 75}))[1]
    assert (second.summary_kind, second.changed_dimension, second.changed_delta) == (
        "changed",
        "clarity",
        -5,
    )
    assert second.summary == "Score -5; clarity -5."


@pytest.mark.parametrize(
    ("dimensions", "expected"),
    [
        ({"impact": 63, "clarity": 83}, "impact"),
        ({"clarity": 78, "relevance": 72}, "clarity"),
    ],
)
def test_tie_on_largest_change_keeps_first_dimension(dimensions, expected):
    assert chain_summaries((65, dimensions))[1].changed_dimension == expected


def test_largest_absolute_change_wins_over_sign():
    second = chain_summaries((61, {"impact": 62, "completeness": 85}))[1]
    assert (second.changed_dimension, second.changed_delta) == ("completeness", -5)


def test_payload_exposes_camel_case_fields():
    payload = chain_summaries((65, {"impact": 63}))[1].model_dump(by_alias=True)
    assert payload["summaryKind"] == "changed"
    assert payload["changedDimension"] == "impact"
    assert payload["changedDelta"] == 3
