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
_tool_unavailable: bool = False  # Set True if Java/LanguageTool fails to start


def get_tool() -> language_tool_python.LanguageTool | None:
    """
    Lazy-load LanguageTool singleton.
    First call is slow (Java server startup + optional JAR download).
    Subsequent calls are fast (reuse running server).
    Returns None if Java is unavailable — callers must handle this.
    """
    global _tool, _tool_unavailable  # noqa: PLW0603
    if _tool_unavailable:
        return None
    if _tool is None:
        logger.info(
            "Starting LanguageTool server (Java required, first call may take 30s)..."
        )
        try:
            _tool = language_tool_python.LanguageTool("en-US")
            logger.info("LanguageTool server ready")
        except Exception as exc:
            _tool_unavailable = True
            logger.warning(
                "LanguageTool unavailable — Java may be missing or broken. "
                "Grammar checks will be skipped.",
                extra={"error": str(exc)},
            )
            return None
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
    if tool is None:
        logger.warning(
            "Grammar check skipped — LanguageTool unavailable (Java missing/broken)"
        )
        return []
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
