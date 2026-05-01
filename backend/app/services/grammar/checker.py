"""
Grammar and spelling check service.

Uses HuggingFace Inference API (Qwen2.5-7B-Instruct) for grammar checking.
No Java or LanguageTool dependency required.
"""

import json
import re

from app.core.config import get_settings
from app.core.logging import structured_logger as logger
from app.services.llm.hf_openai_llm_service import HFOpenAILLMService


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
- Return {"issues": []} if no errors found"""


def check_grammar(text: str) -> list[dict]:
    """
    Check grammar and spelling in CV text using HF Inference API.

    Returns list of issues. Each issue dict:
    {
        "text": str,        # The problematic text
        "offset": int,      # Character offset in original text
        "suggestion": str,  # Corrected replacement text
        "rule": str         # Rule category: "SPELLING", "GRAMMAR", "PUNCTUATION", "STYLE"
    }

    Args:
        text: CV text to check

    Returns:
        List of grammar/spell issue dicts.
        Returns empty list if no issues found or if the API call fails.
    """
    try:
        settings = get_settings()

        if not settings.CV_ANALYZER_HF_API_KEY:
            logger.warning("grammar_skipped_no_api_key")
            return []

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

        if "```" in raw:
            json_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", raw, re.DOTALL)
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
            "grammar_check_done",
            issue_count=len(issues),
        )
    except Exception as exc:
        logger.warning(
            "grammar_check_failed",
            error=str(exc),
        )
        return []
    else:
        return issues
