"""Tests for NLP-04: skill extraction service"""

from unittest.mock import MagicMock, patch

from app.services.nlp.skill_extractor import extract_skills


def _make_mock_nlp(tokens: list[str]):
    """Helper: mock spaCy nlp that produces tokens from given list."""
    mock_tokens = []
    for t in tokens:
        tok = MagicMock()
        tok.text = t
        tok.is_space = False
        mock_tokens.append(tok)

    mock_doc = MagicMock()
    mock_doc.__iter__ = MagicMock(return_value=iter(mock_tokens))

    mock_nlp = MagicMock()
    mock_nlp.return_value = mock_doc
    return mock_nlp


def test_extract_skills_returns_list() -> None:
    """extract_skills always returns a list per NLP-04"""
    with patch(
        "app.services.nlp.skill_extractor.get_nlp",
        return_value=_make_mock_nlp(["Python"]),
    ):
        result = extract_skills("Python developer")

    assert isinstance(result, list)


def test_extract_skills_matches_whitelist_skill() -> None:
    """extract_skills returns skills present in the curated whitelist"""
    with patch(
        "app.services.nlp.skill_extractor.get_nlp",
        return_value=_make_mock_nlp(["Python"]),
    ):
        result = extract_skills("Python developer")

    assert "Python" in result


def test_extract_skills_unknown_token_not_returned() -> None:
    """extract_skills skips tokens not in the curated whitelist"""
    with patch(
        "app.services.nlp.skill_extractor.get_nlp",
        return_value=_make_mock_nlp(["GibberishXYZ123"]),
    ):
        result = extract_skills("GibberishXYZ123")

    assert result == []


def test_extract_skills_returns_sorted() -> None:
    """extract_skills result is sorted alphabetically per NLP-04"""
    with patch(
        "app.services.nlp.skill_extractor.get_nlp",
        return_value=_make_mock_nlp(["Docker", "Python"]),
    ):
        result = extract_skills("Docker Python")

    assert result == sorted(result)


def test_extract_skills_deduplicates() -> None:
    """extract_skills deduplicates repeated mentions of the same skill"""
    with patch(
        "app.services.nlp.skill_extractor.get_nlp",
        return_value=_make_mock_nlp(["Python", "Python", "Python"]),
    ):
        result = extract_skills("Python Python Python")

    assert result.count("Python") == 1


def test_extract_skills_multi_word_phrase() -> None:
    """extract_skills matches multi-word skills like 'Spring Boot'"""
    with patch(
        "app.services.nlp.skill_extractor.get_nlp",
        return_value=_make_mock_nlp(["Spring", "Boot"]),
    ):
        result = extract_skills("Spring Boot")

    assert "Spring Boot" in result


def test_extract_skills_whitelist_covers_common_tech() -> None:
    """Whitelist includes common tech skills (Python, Docker, AWS, etc.)"""
    from app.services.nlp.skill_extractor import _SKILLS_WHITELIST

    for skill in ("python", "docker", "aws", "kubernetes", "postgresql"):
        assert skill in _SKILLS_WHITELIST, f"Expected '{skill}' in whitelist"
