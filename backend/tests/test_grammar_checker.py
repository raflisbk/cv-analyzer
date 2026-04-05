"""Tests for NLP-02: grammar checker service"""

from unittest.mock import MagicMock, patch


def _make_mock_match(
    text: str, offset: int, error_length: int, replacements: list, rule_id: str
):
    """Helper to create mock LanguageTool Match"""
    m = MagicMock()
    m.offset = offset
    m.errorLength = error_length
    m.replacements = replacements
    m.ruleId = rule_id
    return m


def test_check_grammar_returns_list() -> None:
    """check_grammar always returns a list per NLP-02"""
    with patch("app.services.grammar.checker.get_tool") as mock_get_tool:
        mock_tool = MagicMock()
        mock_tool.check.return_value = []
        mock_get_tool.return_value = mock_tool

        from app.services.grammar.checker import check_grammar  # noqa: PLC0415

        result = check_grammar("Perfect grammar here.")

    assert isinstance(result, list)


def test_check_grammar_no_issues_returns_empty() -> None:
    """check_grammar returns empty list when no grammar issues"""
    with patch("app.services.grammar.checker.get_tool") as mock_get_tool:
        mock_tool = MagicMock()
        mock_tool.check.return_value = []
        mock_get_tool.return_value = mock_tool

        from app.services.grammar.checker import check_grammar  # noqa: PLC0415

        result = check_grammar("This text has perfect grammar.")

    assert result == []


def test_check_grammar_returns_issue_with_required_keys() -> None:
    """Each grammar issue has text, offset, suggestion, rule keys per D-12"""
    test_text = "I recieve the package."
    mock_match = _make_mock_match(
        text=test_text,
        offset=2,
        error_length=7,
        replacements=["receive"],
        rule_id="SPELLING",
    )

    with patch("app.services.grammar.checker.get_tool") as mock_get_tool:
        mock_tool = MagicMock()
        mock_tool.check.return_value = [mock_match]
        mock_get_tool.return_value = mock_tool

        from app.services.grammar.checker import check_grammar  # noqa: PLC0415

        result = check_grammar(test_text)

    assert len(result) == 1
    issue = result[0]
    assert "text" in issue
    assert "offset" in issue
    assert "suggestion" in issue
    assert "rule" in issue


def test_check_grammar_captures_spelling_error() -> None:
    """Spelling errors are captured with correct text and suggestion"""
    test_text = "I recieve the package."  # 'recieve' at offset 2
    mock_match = _make_mock_match(
        text=test_text,
        offset=2,
        error_length=7,
        replacements=["receive"],
        rule_id="SPELLING",
    )

    with patch("app.services.grammar.checker.get_tool") as mock_get_tool:
        mock_tool = MagicMock()
        mock_tool.check.return_value = [mock_match]
        mock_get_tool.return_value = mock_tool

        from app.services.grammar.checker import check_grammar  # noqa: PLC0415

        result = check_grammar(test_text)

    issue = result[0]
    assert issue["text"] == "recieve"
    assert issue["suggestion"] == "receive"
    assert issue["rule"] == "SPELLING"
    assert issue["offset"] == 2


def test_check_grammar_empty_suggestion_when_no_replacements() -> None:
    """suggestion is empty string when no replacements available per D-12"""
    test_text = "Test text here."
    mock_match = _make_mock_match(
        text=test_text, offset=0, error_length=4, replacements=[], rule_id="STYLE"
    )

    with patch("app.services.grammar.checker.get_tool") as mock_get_tool:
        mock_tool = MagicMock()
        mock_tool.check.return_value = [mock_match]
        mock_get_tool.return_value = mock_tool

        from app.services.grammar.checker import check_grammar  # noqa: PLC0415

        result = check_grammar(test_text)

    assert result[0]["suggestion"] == ""


def test_check_grammar_multiple_issues() -> None:
    """check_grammar handles multiple issues in one text"""
    test_text = "I recieve and seperate these thing"
    matches = [
        _make_mock_match(test_text, 2, 7, ["receive"], "SPELLING"),
        _make_mock_match(test_text, 14, 8, ["separate"], "SPELLING"),
    ]

    with patch("app.services.grammar.checker.get_tool") as mock_get_tool:
        mock_tool = MagicMock()
        mock_tool.check.return_value = matches
        mock_get_tool.return_value = mock_tool

        from app.services.grammar.checker import check_grammar  # noqa: PLC0415

        result = check_grammar(test_text)

    assert len(result) == 2
