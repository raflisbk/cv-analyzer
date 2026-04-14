"""
Grammar and spelling check service per D-11, D-12, NLP-02.
Primary: language_tool_python (offline Java-based LanguageTool wrapper).
Fallback: LLM-based grammar check via OpenAI API when Java is unavailable.
Lazy-loads singleton to avoid repeated Java process startups.

NOTE: First call downloads ~200MB LanguageTool JAR + starts Java server (10-30s).
      Pre-warm this at FastAPI startup to avoid cold-start timeouts.
"""

import json

import language_tool_python

from app.core.config import get_settings
from app.core.logging import structured_logger as logger


_tool: language_tool_python.LanguageTool | None = None
_tool_unavailable: bool = False  # Set True if Java/LanguageTool fails to start

_GRAMMAR_SYSTEM_PROMPT = """You are a professional CV grammar and spelling checker.
Check the provided CV text for grammar, spelling, punctuation, and style errors.

Respond with ONLY valid JSON matching this exact schema:
{
  "issues": [
    {
      "text": "<exact problematic text copied verbatim from the CV>",
      "suggestion": "<corrected replacement text>",
      "rule": "<SPELLING|GRAMMAR|PUNCTUATION|STYLE>"
    }
  ]
}

Rules:
- "text" MUST be the EXACT substring from the CV (verbatim, case-sensitive)
- Only flag genuine errors, not stylistic CV conventions (e.g. bullet points without subject pronouns are OK)
- SPELLING: misspelled words
- GRAMMAR: subject-verb disagreement, tense inconsistency, wrong article, etc.
- PUNCTUATION: missing or incorrect punctuation
- STYLE: inconsistent capitalisation, redundant words, awkward phrasing
- Return at most 20 issues
- Return {"issues": []} if no errors found
"""


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


def _check_grammar_with_llm(text: str) -> list[dict]:
    """LLM-based grammar check fallback using HF Inference Qwen2.5 when LanguageTool is unavailable."""
    try:
        from app.services.llm.hf_openai_llm_service import HFOpenAILLMService

        settings = get_settings()

        if not settings.CV_ANALYZER_HF_API_KEY:
            raise ValueError("HF API key not configured")

        llm_service = HFOpenAILLMService()

        user_prompt = f"CV Text:\n{text[:5000]}"

        response = llm_service.client.chat.completions.create(
            model=llm_service.model,
            messages=[
                {"role": "system", "content": _GRAMMAR_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
            max_tokens=1000,
        )

        raw = response.choices[0].message.content.strip()

        # Extract JSON from response if wrapped in markdown
        if "```" in raw:
            import re

            json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', raw, re.DOTALL)
            if json_match:
                raw = json_match.group(1)

        data = json.loads(raw)
        issues_raw = data.get("issues", [])

        issues: list[dict] = []
        for item in issues_raw:
            issue_text = item.get("text", "")
            if not issue_text:
                continue
            offset = text.find(issue_text)
            issues.append(
                {
                    "text": issue_text,
                    "offset": max(offset, 0),
                    "suggestion": item.get("suggestion", ""),
                    "rule": item.get("rule", "GRAMMAR"),
                }
            )

        logger.info(
            "HF LLM grammar check complete",
            extra={"issue_count": len(issues)},
        )
        return issues
    except Exception as exc:
        logger.warning(
            "HF LLM grammar check failed — returning empty list",
            extra={"error": str(exc)},
        )
    return []


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

    Primary path: LanguageTool (Java-based, offline).
    Fallback: LLM-based check via OpenAI when Java unavailable.

    Args:
        text: CV text to check

    Returns:
        List of grammar/spell issue dicts per D-12.
        Returns empty list if no issues found.
    """
    tool = get_tool()
    if tool is None:
        logger.info("LanguageTool unavailable — using LLM grammar check fallback")
        return _check_grammar_with_llm(text)

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
