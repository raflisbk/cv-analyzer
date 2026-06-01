import json
import re
from collections.abc import AsyncGenerator

from openai import OpenAI
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import get_settings
from app.core.logging import structured_logger as logger
from app.services.llm.metrics import llm_tokens_counter
from app.services.llm.protocol import SuggestionsOutput

_SYSTEM_PROMPT_TEMPLATE = """You are an expert CV coach and recruitment specialist.
Analyze the provided CV and generate specific, actionable improvement suggestions.

{rag_context}

Respond with ONLY valid JSON matching this exact schema:
{{
  "suggestions": [
    {{
      "section": "<section name>",
      "suggestions": [
        {{
          "priority": "<high_impact|quick_win>",
          "text": "<specific actionable suggestion>",
          "explanation": "<short reasoning why this is suggested>",
          "type": "<action_verb|impact_metric|missing_section>",
          "original_text": "<EXACT text from the CV being improved, copy verbatim>",
          "after_text": "<rewritten version of original_text that implements this suggestion>"
        }}
      ]
    }}
  ]
}}

Rules:
- "high_impact" = significant improvement requiring effort
- "quick_win" = easy to fix, immediate improvement
- "action_verb" = replace weak verbs (e.g., managed → led)
- "impact_metric" = add quantifiable results (e.g., increased sales by 30%)
- "missing_section" = add absent but valuable section
- For each suggestion, you MUST provide "original_text": the EXACT text from the user's CV that this suggestion is improving (copy it verbatim)
- For each suggestion, you MUST provide "after_text": a concrete rewritten version of "original_text" that directly implements the suggestion
- Generate 2-4 suggestions per section, focusing on sections with most room for improvement
- Be specific: reference actual content from the CV text"""

_USER_PROMPT_TEMPLATE = """CV Text:
{cv_text}

Detected Sections: {sections_json}

Generate improvement suggestions for this CV."""

_COMPARISON_SYSTEM_PROMPT = (
    "You are an expert CV/resume evaluator. "
    "Compare the provided CV against the job description and return a JSON object. "
    "Be specific, evidence-based, and concise.\n\n"
    "Return ONLY valid JSON matching this exact schema:\n"
    "{\n"
    '  "match_pct": <integer 0-100>,\n'
    '  "matched_skills": [<string>],\n'
    '  "missing_skills": [<string>],\n'
    '  "matched_experience": [<string>],\n'
    '  "missing_experience": [<string>],\n'
    '  "overall_recommendation": <string, max 200 chars>\n'
    "}"
)

_CHARS_PER_TOKEN = 3.5


def _estimate_tokens(text: str) -> int:
    return max(1, int(len(text) / _CHARS_PER_TOKEN))


def _build_system_prompt(rag_context: str) -> str:
    context_text = (
        "\n\n".join(rag_context) if isinstance(rag_context, list) else rag_context
    )
    return _SYSTEM_PROMPT_TEMPLATE.format(
        rag_context=context_text or "No additional context available."
    )


def _build_user_prompt(cv_text: str, sections: list[dict]) -> str:
    return _USER_PROMPT_TEMPLATE.format(
        cv_text=cv_text[:6000],
        sections_json=json.dumps(sections, indent=2),
    )


def _extract_json(response: str) -> str:
    response = response.strip()
    if "```" in response:
        json_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", response, re.DOTALL)
        if json_match:
            return json_match.group(1)
    brace_match = re.search(r"\{.*\}", response, re.DOTALL)
    if brace_match:
        return brace_match.group(0)
    return response


def _log_tokens(model: str, prompt_tokens: int, completion_tokens: int) -> None:
    llm_tokens_counter.labels(provider="koboi", model=model, type="prompt").inc(
        prompt_tokens
    )
    llm_tokens_counter.labels(provider="koboi", model=model, type="completion").inc(
        completion_tokens
    )


class KoboiLLMService:

    def __init__(self) -> None:
        settings = get_settings()
        self._api_key = settings.CV_ANALYZER_KOBOI_API_KEY
        self.model = settings.CV_ANALYZER_LLM_MODEL
        self.max_tokens = settings.CV_ANALYZER_LLM_MAX_TOKENS
        self._client: OpenAI | None = None

    @property
    def client(self) -> OpenAI:
        if self._client is None:
            if not self._api_key:
                msg = (
                    "CV_ANALYZER_KOBOI_API_KEY not configured. "
                    "Please set it in your .env file."
                )
                raise ValueError(msg)
            settings = get_settings()
            self._client = OpenAI(
                base_url=settings.CV_ANALYZER_KOBOI_BASE_URL,
                api_key=self._api_key,
            )
        return self._client

    def _chat(
        self,
        system_prompt: str,
        user_prompt: str,
        temperature: float = 0.7,
        max_tokens: int | None = None,
    ) -> str:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=temperature,
            max_tokens=max_tokens or self.max_tokens,
        )
        return response.choices[0].message.content or ""

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True,
    )
    def generate_suggestions(
        self,
        cv_text: str,
        sections: list[dict],
        rag_context: str,
    ) -> dict:
        system_prompt = _build_system_prompt(rag_context)
        user_prompt = _build_user_prompt(cv_text, sections)

        raw_json = self._chat(system_prompt, user_prompt)

        logger.info(
            "llm_raw_response",
            raw_length=len(raw_json),
            raw_preview=raw_json[:200] if raw_json else None,
        )

        if not raw_json or not raw_json.strip():
            msg = "LLM returned empty response"
            raise ValueError(msg)

        raw_json = _extract_json(raw_json)

        prompt_tokens = _estimate_tokens(system_prompt + user_prompt)
        completion_tokens = _estimate_tokens(raw_json)
        _log_tokens(self.model, prompt_tokens, completion_tokens)

        logger.info(
            "llm_suggestions_generated",
            model=self.model,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
        )

        return {
            "raw_json": raw_json,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
        }

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True,
    )
    def compare_cv(self, cv_text: str, jd_text: str) -> dict:
        user_prompt = (
            f"Job Description:\n{jd_text[:2000]}\n\n"
            f"=== CANDIDATE CV ===\n{cv_text[:4000]}\n\n"
            "Compare the CV against the job description. "
            "Focus on technical skills, years of experience, and key qualifications. "
            "Return the JSON comparison."
        )

        raw_json = self._chat(_COMPARISON_SYSTEM_PROMPT, user_prompt, temperature=0.7)
        raw_json = _extract_json(raw_json)
        comparison_data = json.loads(raw_json)

        prompt_tokens = _estimate_tokens(_COMPARISON_SYSTEM_PROMPT + user_prompt)
        completion_tokens = _estimate_tokens(raw_json)
        _log_tokens(self.model, prompt_tokens, completion_tokens)

        logger.info(
            "llm_comparison_generated",
            model=self.model,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
        )

        return {
            "comparison": comparison_data,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
        }

    def inline_rewrite(
        self, text: str, prompt: str, context: dict | None = None
    ) -> dict:
        user_prompt = (
            f'Here is a snippet of text from a CV:\n"{text}"\n\n'
            f"Please rewrite this text according to the following instruction: {prompt}\n\n"
        )
        if context:
            user_prompt += f"Context about the CV: {json.dumps(context)[:500]}\n\n"
        user_prompt += "Return ONLY the rewritten text, nothing else."

        rewritten = self._chat(
            "You are an expert CV editor. You rewrite text cleanly and professionally.",
            user_prompt,
            max_tokens=500,
        )

        rewritten = rewritten.strip()
        if rewritten.startswith('"') and rewritten.endswith('"'):
            rewritten = rewritten[1:-1]

        prompt_tokens = _estimate_tokens(user_prompt)
        completion_tokens = _estimate_tokens(rewritten)
        _log_tokens(self.model, prompt_tokens, completion_tokens)

        return {
            "rewritten_text": rewritten,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
        }

    async def generate_suggestions_stream(
        self,
        system_prompt: str,
        user_prompt: str,
    ) -> AsyncGenerator[str]:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            max_tokens=self.max_tokens,
            stream=True,
        )

        for chunk in response:
            delta = chunk.choices[0].delta.content if chunk.choices else None
            if delta:
                yield delta

    def validate_output(self, raw_json: str) -> SuggestionsOutput:
        if not raw_json or not raw_json.strip():
            msg = "Empty JSON response from LLM"
            raise ValueError(msg)

        try:
            data = json.loads(raw_json)
        except json.JSONDecodeError as e:
            logger.error(
                "llm_json_parse_failed",
                error=str(e),
                raw_length=len(raw_json),
                raw_preview=raw_json[:500] if raw_json else None,
                exc_info=True,
            )
            msg = f"Invalid JSON from LLM: {e}"
            raise ValueError(msg) from e

        return SuggestionsOutput.model_validate(data)
