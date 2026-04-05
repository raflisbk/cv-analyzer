"""
Grammar and spelling check service per D-11, D-12, NLP-02.
Uses language_tool_python (offline Java-based LanguageTool wrapper).
Lazy-loads singleton to avoid repeated Java process startups.

NOTE: First call downloads ~200MB LanguageTool JAR + starts Java server (10-30s).
      Pre-warm this at FastAPI startup to avoid cold-start timeouts.
"""

import language_tool_python

from app.core.logging import structured_logger as logger


_tool: language_tool_python.LanguageTool | None = None


def get_tool() -> language_tool_python.LanguageTool:
    """
    Lazy-load LanguageTool singleton.
    First call is slow (Java server startup + optional JAR download).
    Subsequent calls are fast (reuse running server).
    """
    global _tool  # noqa: PLW0603
    if _tool is None:
        logger.info(
            "Starting LanguageTool server (Java required, first call may take 30s)..."
        )
        _tool = language_tool_python.LanguageTool("en-US")
        logger.info("LanguageTool server ready")
    return _tool


def check_grammar(text: str) -> list[dict]:
    """
    Check grammar and spelling in CV text per D-12, NLP-02.

    Returns list of issues. Each issue dict:
    {
        "text": str,        # The problematic text
        "offset": int,      # Character offset in original text
        "suggestion": str,  # First replacement suggestion (empty string if none)
        "rule": str         # Rule ID, e.g. "SPELLING", "GRAMMAR", "PUNCTUATION"
    }

    Args:
        text: CV text to check

    Returns:
        List of grammar/spell issue dicts per D-12.
        Returns empty list if LanguageTool finds no issues.
    """
    tool = get_tool()
    matches = tool.check(text)

    issues: list[dict] = []
    for match in matches:
        issues.append(
            {
                "text": text[match.offset : match.offset + match.errorLength],
                "offset": match.offset,
                "suggestion": match.replacements[0] if match.replacements else "",
                "rule": match.ruleId,
            }
        )

    logger.info("Grammar check complete", extra={"issue_count": len(issues)})
    return issues
