"""Tests for NLP-04: skill extraction service"""

from unittest.mock import MagicMock, patch

from app.services.nlp.skill_extractor import extract_skills


def _make_mock_nlp_with_token(text: str):
    """Helper to create mock spaCy nlp that processes given text"""
    mock_token = MagicMock()
    mock_token.text = "Python"
    mock_token.is_alpha = True
    mock_token.is_stop = False

    mock_doc = MagicMock()
    mock_doc.noun_chunks = []
    mock_doc.__iter__ = MagicMock(return_value=iter([mock_token]))

    mock_nlp = MagicMock()
    mock_nlp.return_value = mock_doc
    return mock_nlp


def test_extract_skills_returns_list() -> None:
    """extract_skills always returns a list per NLP-04"""
    mock_nlp = _make_mock_nlp_with_token("Python")

    with (
        patch("app.services.nlp.skill_extractor.get_nlp", return_value=mock_nlp),
        patch(
            "app.services.nlp.skill_extractor.get_esco_skills",
            return_value=["Python", "FastAPI", "Docker"],
        ),
    ):
        result = extract_skills("Python developer")

    assert isinstance(result, list)


def test_extract_skills_matches_esco_skills() -> None:
    """extract_skills returns skills that are in the ESCO list"""
    mock_nlp = _make_mock_nlp_with_token("Python")

    with (
        patch("app.services.nlp.skill_extractor.get_nlp", return_value=mock_nlp),
        patch(
            "app.services.nlp.skill_extractor.get_esco_skills",
            return_value=["Python", "FastAPI", "Docker"],
        ),
    ):
        result = extract_skills("Python developer")

    assert "Python" in result


def test_extract_skills_empty_esco_returns_empty() -> None:
    """extract_skills returns empty list when ESCO is empty"""
    mock_nlp = _make_mock_nlp_with_token("Python")

    with (
        patch("app.services.nlp.skill_extractor.get_nlp", return_value=mock_nlp),
        patch(
            "app.services.nlp.skill_extractor.get_esco_skills",
            return_value=[],
        ),
    ):
        result = extract_skills("Python developer")

    assert result == []


def test_extract_skills_returns_sorted() -> None:
    """extract_skills result is sorted alphabetically"""
    mock_token_py = MagicMock()
    mock_token_py.text = "Python"
    mock_token_py.is_alpha = True
    mock_token_py.is_stop = False

    mock_token_docker = MagicMock()
    mock_token_docker.text = "Docker"
    mock_token_docker.is_alpha = True
    mock_token_docker.is_stop = False

    mock_doc = MagicMock()
    mock_doc.noun_chunks = []
    mock_doc.__iter__ = MagicMock(return_value=iter([mock_token_docker, mock_token_py]))

    mock_nlp_instance = MagicMock()
    mock_nlp_instance.return_value = mock_doc

    with (
        patch(
            "app.services.nlp.skill_extractor.get_nlp", return_value=mock_nlp_instance
        ),
        patch(
            "app.services.nlp.skill_extractor.get_esco_skills",
            return_value=["Python", "Docker"],
        ),
    ):
        result = extract_skills("Python Docker")

    assert result == sorted(result)


def test_get_esco_skills_loads_csv(tmp_path) -> None:
    """get_esco_skills loads preferredLabel from CSV per NLP-04"""
    csv_content = "conceptUri,preferredLabel,altLabels,description\n"
    csv_content += "http://esco/1,Python programming,python\n"
    csv_content += "http://esco/2,Docker,containerization\n"

    csv_file = tmp_path / "esco_skills.csv"
    csv_file.write_text(csv_content, encoding="utf-8-sig")

    with patch("app.services.nlp.skill_extractor._ESCO_PATH", csv_file):
        import app.services.nlp.skill_extractor as mod  # noqa: PLC0415

        mod._ESCO_SKILLS = []

        skills = mod.get_esco_skills()

    assert "Python programming" in skills
    assert "Docker" in skills
