from types import SimpleNamespace

import pytest

from app.services.workspace_data.ats_compat import compatibility
from app.services.workspace_data.ats_parsed import parsed_fields
from app.services.workspace_data.ats_view import ats_data
from app.services.workspace_data.grammar_stats import grammar_stats
from app.services.workspace_data.grammar_view import grammar_data, note_id
from app.services.workspace_data.plain_text import plain_text


@pytest.mark.parametrize(("status", "rating"), [("pass", 5), ("warn", 3), ("fail", 1)])
def test_compatibility_rubric_for_each_system(status, rating):
    checks = [{"check": "Standard sections present", "status": status}]
    assert all(item.rating == rating for item in compatibility(checks))


def test_plain_text_flags_parser_risks_and_hidden_snippets():
    view = plain_text("Normal\n• Bullet\nsecret text\n\ufffd", ["secret text"])
    assert [line.flagged for line in view.lines] == [False, True, True, True]
    assert "3" in view.note


def test_parsed_fields_use_real_entities_and_validated_contacts():
    nlp = {"entities": {"persons": ["Ada Lovelace"], "locations": ["London"]}}
    fields = {
        item.field: item
        for item in parsed_fields(nlp, "Ada Lovelace\nada@example.com\nLondon")
    }
    assert fields["Name"].value == "Ada Lovelace"
    assert fields["Email"].confidence == 100
    assert fields["Name"].confidence == 80
    assert fields["Phone"].value == ""
    assert fields["Phone"].confidence == 0


def test_parsed_fields_do_not_treat_date_range_as_phone():
    fields = {item.field: item for item in parsed_fields({}, "Worked 2020-2025")}
    assert fields["Phone"].value == ""


def test_grammar_stats_known_sentence():
    stats = grammar_stats("The cat sat. The dog ran.")
    assert stats.words_per_sentence == 3.0
    assert stats.passive_lines == 0
    assert stats.reading_grade == -2.6


def test_note_id_is_stable_when_issues_reorder():
    issue = {
        "offset": 12,
        "text": "recieve",
        "suggestion": "receive",
        "rule": "SPELLING",
    }
    assert note_id(issue) == note_id(dict(issue))
    job = SimpleNamespace(
        result={"text": "Summary\nrecieve"}, nlp_result=None, grammar_issues=[issue]
    )
    assert grammar_data(job).notes[0].id == note_id(issue)


def test_empty_jobs_return_valid_payloads():
    job = SimpleNamespace(
        scores=None, ats_checks=None, grammar_issues=None, result=None, nlp_result=None
    )
    assert ats_data(job).score == 0
    assert ats_data(job).hidden_text.found is False
    assert grammar_data(job).notes == []
