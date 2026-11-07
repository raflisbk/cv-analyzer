from unittest.mock import patch

import pytest

from app.services.llm import cv_profile_extractor as extractor
from app.services.nlp.section_detector import CvSection

CV_TEXT = (
    "Jane Doe\nBackend Engineer\n"
    "Acme Corp, Jakarta - 2021-Present\n"
    "Built FastAPI services with PostgreSQL and Redis. Skills: Python, SQL"
)


@pytest.fixture
def llm_settings(monkeypatch):
    settings = extractor.get_settings()
    monkeypatch.setattr(settings, "CV_ANALYZER_KOBOI_API_KEY", "test-key")
    monkeypatch.setattr(extractor, "_cache_get", lambda key, settings: None)
    monkeypatch.setattr(extractor, "_cache_set", lambda key, data, settings: None)


def test_normalise_keeps_only_verbatim_skills_and_entities():
    data = {
        "detected_role": '"Backend Engineer".',
        "skills": ["python", "FastAPI", "Kubernetes", "FastAPI", 7],
        "entities": {
            "organizations": ["Acme Corp", "Globex"],
            "locations": ["Jakarta"],
        },
    }

    profile = extractor._normalise(data, CV_TEXT)

    assert profile["skills"] == ["FastAPI", "python"]
    assert profile["entities"]["organizations"] == ["Acme Corp"]
    assert profile["entities"]["locations"] == ["Jakarta"]
    assert profile["entities"]["persons"] == []
    assert profile["detected_role"] == "Backend Engineer"


def test_clean_role_rejects_sentences():
    assert (
        extractor._clean_role("a very long sentence that is clearly not a title")
        is None
    )
    assert extractor._clean_role(None) is None


def test_parse_json_recovers_from_wrapped_and_broken_output():
    assert extractor._parse_json('```json\n{"skills": ["a"]}\n```') == {"skills": ["a"]}
    assert extractor._parse_json("no json here") is None
    assert extractor._parse_json('{"skills": ["a",}') == {"skills": ["a"]}


def test_extract_cv_profile_returns_empty_without_api_key(monkeypatch):
    monkeypatch.setattr(extractor.get_settings(), "CV_ANALYZER_KOBOI_API_KEY", "")

    profile = extractor.extract_cv_profile(CV_TEXT)

    assert profile == extractor._empty_profile()


def test_extract_cv_profile_normalises_llm_response(llm_settings):
    llm_json = {
        "detected_role": "Backend Engineer",
        "skills": ["Python", "Rust"],
        "entities": {"organizations": ["Acme Corp"]},
    }

    with patch.object(extractor, "_request_profile", return_value=llm_json):
        profile = extractor.extract_cv_profile(CV_TEXT)

    assert profile["skills"] == ["Python"]
    assert profile["entities"]["organizations"] == ["Acme Corp"]
    assert profile["detected_role"] == "Backend Engineer"


def test_extract_cv_profile_falls_back_to_empty_on_failure(llm_settings):
    with patch.object(extractor, "_request_profile", side_effect=RuntimeError("boom")):
        profile = extractor.extract_cv_profile(CV_TEXT)

    assert profile == extractor._empty_profile()


def test_extract_cv_profile_falls_back_to_empty_on_unparseable_response(llm_settings):
    with patch.object(extractor, "_request_profile", return_value=None):
        profile = extractor.extract_cv_profile(CV_TEXT)

    assert profile == extractor._empty_profile()


def test_attach_entities_assigns_by_section_text():
    sections = [
        CvSection(type="experience", text="Acme Corp, Jakarta 2021", start_line=0),
        CvSection(type="skills", text="Python, SQL", start_line=3),
    ]
    entities = {"organizations": ["Acme Corp"], "locations": ["Jakarta"]}

    extractor.attach_entities(sections, entities)

    assert {e["text"] for e in sections[0].entities} == {"Acme Corp", "Jakarta"}
    assert sections[0].entities[0]["label"] == "ORG"
    assert sections[1].entities == []
