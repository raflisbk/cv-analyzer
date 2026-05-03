"""Tests for NLP-05: entity extraction service"""

from unittest.mock import MagicMock, patch

import pytest

from app.services.nlp.entity_extractor import extract_entities


@pytest.fixture
def mock_spacy_doc_with_entities():
    """Mock spaCy doc with known ORG and DATE entities"""
    mock_ent_org = MagicMock()
    mock_ent_org.text = "Acme Corp"
    mock_ent_org.label_ = "ORG"

    mock_ent_date = MagicMock()
    mock_ent_date.text = "2021"
    mock_ent_date.label_ = "DATE"

    mock_ent_person = MagicMock()
    mock_ent_person.text = "John Doe"
    mock_ent_person.label_ = "PERSON"

    mock_doc = MagicMock()
    mock_doc.ents = [mock_ent_org, mock_ent_date, mock_ent_person]
    return mock_doc


def test_extract_entities_returns_dict(mock_spacy_doc_with_entities) -> None:
    """extract_entities returns dict with expected keys"""
    with patch("app.services.nlp.entity_extractor.get_nlp") as mock_get_nlp:
        mock_nlp = MagicMock()
        mock_nlp.return_value = mock_spacy_doc_with_entities
        mock_get_nlp.return_value = mock_nlp

        result = extract_entities("Senior Engineer at Acme Corp since 2021")

    assert isinstance(result, dict)
    assert "organizations" in result
    assert "dates" in result
    assert "persons" in result
    assert "locations" in result


def test_extract_entities_captures_org(mock_spacy_doc_with_entities) -> None:
    """extract_entities captures ORG entities per NLP-05"""
    with patch("app.services.nlp.entity_extractor.get_nlp") as mock_get_nlp:
        mock_nlp = MagicMock()
        mock_nlp.return_value = mock_spacy_doc_with_entities
        mock_get_nlp.return_value = mock_nlp

        result = extract_entities("Senior Engineer at Acme Corp since 2021")

    assert "Acme Corp" in result["organizations"]


def test_extract_entities_captures_date(mock_spacy_doc_with_entities) -> None:
    """extract_entities captures DATE entities per NLP-05"""
    with patch("app.services.nlp.entity_extractor.get_nlp") as mock_get_nlp:
        mock_nlp = MagicMock()
        mock_nlp.return_value = mock_spacy_doc_with_entities
        mock_get_nlp.return_value = mock_nlp

        result = extract_entities("Senior Engineer at Acme Corp since 2021")

    assert "2021" in result["dates"]


def test_extract_entities_no_entities_returns_empty_lists() -> None:
    """extract_entities handles doc with no entities"""
    mock_doc = MagicMock()
    mock_doc.ents = []

    with patch("app.services.nlp.entity_extractor.get_nlp") as mock_get_nlp:
        mock_nlp = MagicMock()
        mock_nlp.return_value = mock_doc
        mock_get_nlp.return_value = mock_nlp

        result = extract_entities("No named entities here")

    assert result["organizations"] == []
    assert result["dates"] == []
