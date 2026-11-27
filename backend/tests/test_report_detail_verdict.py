from types import SimpleNamespace

import pytest

from app.services.report_detail.verdict import fact_counts, facts, verdict


@pytest.mark.parametrize(
    ("score", "key"),
    [
        (0, "needs"),
        (49, "needs"),
        (50, "room"),
        (69, "room"),
        (70, "good"),
        (84, "good"),
        (85, "strong"),
        (100, "strong"),
    ],
)
def test_verdict_key_follows_score_floor(score, key):
    assert verdict(score).key == key


def test_verdict_keeps_english_text_for_older_clients():
    result = verdict(60)
    assert (result.title, result.body) == (
        "Room to improve",
        "Focus on the lowest scoring dimensions first.",
    )


def test_fact_counts_expose_numbers_and_facts_keep_text():
    job = SimpleNamespace(
        result={"text": "one two three"},
        file_metadata={"pages": 2},
        nlp_result={"sections": []},
        scores=None,
        cv_document=None,
    )
    counts = fact_counts(job)
    assert (counts.pages, counts.words) == (2, 3)
    assert facts(job)[:3] == [
        f"{counts.pages} pages",
        f"{counts.bullets} bullets",
        "3 words",
    ]
