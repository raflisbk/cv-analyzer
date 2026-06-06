"""Tests for NLP-02: grammar checker service (HF Inference-based)"""

from unittest.mock import MagicMock, patch

from app.services.grammar.checker import check_grammar


def _mock_llm_raw_response(issues: list[dict]) -> str:
    """Helper to create mock LLM raw JSON string with grammar issues."""
    import json

    return json.dumps({"issues": issues})


def test_check_grammar_returns_list() -> None:
    """check_grammar always returns a list per NLP-02"""
    with patch("app.services.grammar.checker.KoboiLLMService") as mock_cls:
        mock_svc = MagicMock()
        mock_svc._chat.return_value = '{"issues": []}'
        mock_cls.return_value = mock_svc

        with patch("app.services.grammar.checker.get_settings") as mock_settings:
            mock_settings.return_value.CV_ANALYZER_KOBOI_API_KEY = "test-key"
            result = check_grammar("Perfect grammar here.")

    assert isinstance(result, list)


def test_check_grammar_no_issues_returns_empty() -> None:
    """check_grammar returns empty list when LLM finds no issues"""
    with patch("app.services.grammar.checker.KoboiLLMService") as mock_cls:
        mock_svc = MagicMock()
        mock_svc._chat.return_value = '{"issues": []}'
        mock_cls.return_value = mock_svc

        with patch("app.services.grammar.checker.get_settings") as mock_settings:
            mock_settings.return_value.CV_ANALYZER_KOBOI_API_KEY = "test-key"
            result = check_grammar("This text has perfect grammar.")

    assert result == []


def test_check_grammar_returns_issue_with_required_keys() -> None:
    """Each grammar issue has text, offset, suggestion, rule keys per D-12"""
    with patch("app.services.grammar.checker.KoboiLLMService") as mock_cls:
        mock_svc = MagicMock()
        mock_svc._chat.return_value = _mock_llm_raw_response(
            [
                {
                    "text": "recieve",
                    "suggestion": "receive",
                    "rule": "SPELLING",
                }
            ]
        )
        mock_cls.return_value = mock_svc

        with patch("app.services.grammar.checker.get_settings") as mock_settings:
            mock_settings.return_value.CV_ANALYZER_KOBOI_API_KEY = "test-key"
            result = check_grammar("I recieve the package.")

    assert len(result) == 1
    issue = result[0]
    assert "text" in issue
    assert "offset" in issue
    assert "suggestion" in issue
    assert "rule" in issue


def test_check_grammar_captures_spelling_error() -> None:
    """Spelling errors are captured with correct text and suggestion"""
    with patch("app.services.grammar.checker.KoboiLLMService") as mock_cls:
        mock_svc = MagicMock()
        mock_svc._chat.return_value = _mock_llm_raw_response(
            [
                {
                    "text": "recieve",
                    "suggestion": "receive",
                    "rule": "SPELLING",
                }
            ]
        )
        mock_cls.return_value = mock_svc

        with patch("app.services.grammar.checker.get_settings") as mock_settings:
            mock_settings.return_value.CV_ANALYZER_KOBOI_API_KEY = "test-key"
            result = check_grammar("I recieve the package.")

    issue = result[0]
    assert issue["text"] == "recieve"
    assert issue["suggestion"] == "receive"
    assert issue["rule"] == "SPELLING"
    assert issue["offset"] == 2


def test_check_grammar_empty_suggestion_when_missing() -> None:
    """suggestion defaults to empty string when not provided by LLM"""
    with patch("app.services.grammar.checker.KoboiLLMService") as mock_cls:
        mock_svc = MagicMock()
        mock_svc._chat.return_value = _mock_llm_raw_response(
            [{"text": "Test text", "rule": "STYLE"}]
        )
        mock_cls.return_value = mock_svc

        with patch("app.services.grammar.checker.get_settings") as mock_settings:
            mock_settings.return_value.CV_ANALYZER_KOBOI_API_KEY = "test-key"
            result = check_grammar("Test text here.")

    assert result[0]["suggestion"] == ""


def test_check_grammar_multiple_issues() -> None:
    """check_grammar handles multiple issues in one text"""
    with patch("app.services.grammar.checker.KoboiLLMService") as mock_cls:
        mock_svc = MagicMock()
        mock_svc._chat.return_value = _mock_llm_raw_response(
            [
                {"text": "recieve", "suggestion": "receive", "rule": "SPELLING"},
                {"text": "seperate", "suggestion": "separate", "rule": "SPELLING"},
            ]
        )
        mock_cls.return_value = mock_svc

        with patch("app.services.grammar.checker.get_settings") as mock_settings:
            mock_settings.return_value.CV_ANALYZER_KOBOI_API_KEY = "test-key"
            result = check_grammar("I recieve and seperate these thing")

    assert len(result) == 2


def test_check_grammar_no_api_key_returns_empty() -> None:
    """Returns empty list when HF API key is not configured"""
    with patch("app.services.grammar.checker.get_settings") as mock_settings:
        mock_settings.return_value.CV_ANALYZER_KOBOI_API_KEY = ""
        result = check_grammar("Some text")

    assert result == []


def test_check_grammar_llm_failure_returns_empty() -> None:
    """Returns empty list when LLM call fails"""
    with patch("app.services.grammar.checker.KoboiLLMService") as mock_cls:
        mock_svc = MagicMock()
        mock_svc._chat.side_effect = Exception("API error")
        mock_cls.return_value = mock_svc

        with patch("app.services.grammar.checker.get_settings") as mock_settings:
            mock_settings.return_value.CV_ANALYZER_KOBOI_API_KEY = "test-key"
            result = check_grammar("Some text")

    assert result == []
