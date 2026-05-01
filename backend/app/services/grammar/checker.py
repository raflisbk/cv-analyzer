import json
import re

from app.core.config import get_settings
from app.core.logging import structured_logger as logger
from app.services.llm.hf_llm_service import HFLLMService


_GRAMMAR_SYSTEM_PROMPT_EN = """You are a professional CV grammar and spelling checker.
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

_GRAMMAR_SYSTEM_PROMPT_ID = """Anda adalah pemeriksa tata bahasa dan ejaan CV profesional dalam bahasa Indonesia.
Periksa teks CV yang diberikan untuk kesalahan tata bahasa, ejaan, tanda baca, dan gaya penulisan.

Balas HANYA dengan JSON valid sesuai skema ini:
{
  "issues": [
    {
      "text": "<teks bermasalah yang disalin persis dari CV>",
      "suggestion": "<teks perbaikan>",
      "rule": "<SPELLING|GRAMMAR|PUNCTUATION|STYLE>"
    }
  ]
}

Aturan:
- "text" HARUS substring PERSIS dari CV (verbatim, case-sensitive)
- Hanya tandai kesalahan asli, bukan konvensi CV (bullet point tanpa subjek boleh)
- SPELLING: kata salah eja
- GRAMMAR: kesalahan subjek-predikat, inkonsistensi waktu, dsb.
- PUNCTUATION: tanda baca hilang atau salah
- STYLE: kapitalisasi tidak konsisten, kata berlebihan, kalimat kaku
- Maksimal 20 masalah
- Kembalikan {"issues": []} jika tidak ada kesalahan"""

_MAX_TEXT_LENGTH = 10000
_MIN_INDONESIAN_WORDS = 4

_INDONESIAN_INDICATORS = {
    "yang",
    "dan",
    "dengan",
    "untuk",
    "dari",
    "ini",
    "itu",
    "pada",
    "dalam",
    "adalah",
    "telah",
    "sudah",
    "akan",
    "bisa",
    "harus",
    "sebagai",
    "oleh",
    "ke",
    "di",
    "se",
    "atau",
    "juga",
    "tidak",
    "ada",
    "lebih",
    "satu",
    "pengalaman",
    "pendidikan",
    "keahlian",
    "kerja",
    "perusahaan",
    "manajemen",
    "pengembangan",
    "mengelola",
    "menggunakan",
    "membuat",
    "melakukan",
}


def _detect_indonesian(text: str) -> bool:
    words = set(text.lower().split())
    matches = words & _INDONESIAN_INDICATORS
    return len(matches) >= _MIN_INDONESIAN_WORDS


def check_grammar(text: str) -> list[dict]:
    try:
        settings = get_settings()

        if not settings.CV_ANALYZER_HF_API_KEY:
            logger.warning("grammar_skipped_no_api_key")
            return []

        llm_service = HFLLMService()

        is_indonesian = _detect_indonesian(text[:2000])
        system_prompt = (
            _GRAMMAR_SYSTEM_PROMPT_ID if is_indonesian else _GRAMMAR_SYSTEM_PROMPT_EN
        )
        truncated = text[:_MAX_TEXT_LENGTH]

        user_prompt = f"CV Text:\n{truncated}"

        raw = llm_service._chat(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            temperature=0.3,
            max_tokens=1000,
        ).strip()

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
            language="id" if is_indonesian else "en",
        )
    except Exception as exc:
        logger.warning(
            "grammar_check_failed",
            error=str(exc),
        )
        return []
    else:
        return issues
