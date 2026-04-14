"""
HF Inference LLM service using huggingface_hub InferenceClient.
Supports both batch processing and streaming for inline chat.
"""

import json
from typing import AsyncGenerator

from huggingface_hub import InferenceClient
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import get_settings
from app.core.logging import structured_logger as logger
from app.services.llm.metrics import llm_tokens_counter
from app.services.llm.protocol import SuggestionsOutput


# Model configuration for HF Inference
HF_MODEL = "Qwen/Qwen2.5-7B-Instruct"


_SYSTEM_PROMPT_TEMPLATE = """You are an expert CV coach and recruitment specialist.
Analyze the provided CV and generate specific, actionable improvement suggestions.

## CV Best Practices Context
{rag_context}

## Output Format
Respond with ONLY valid JSON matching this exact schema:
{{
  "suggestions": [
    {{
      "section": "<section name>",
      "suggestions": [
        {{
          "priority": "<high_impact|quick_win>",
          "text": "<specific actionable suggestion>",
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
- Generate 2-4 suggestions per section
- Be specific: reference actual content from the CV text
"""

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


class HFOpenAILLMService:
    """LLM service using HF Inference via InferenceClient."""

    def __init__(self) -> None:
        settings = get_settings()

        if not settings.CV_ANALYZER_HF_API_KEY:
            raise ValueError(
                "CV_ANALYZER_HF_API_KEY not configured. "
                "Please set it in your .env file."
            )

        # Use HF Inference client
        self.client = InferenceClient(token=settings.CV_ANALYZER_HF_API_KEY)
        self.model = HF_MODEL

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
        """
        Generate CV suggestions using Qwen2.5 via HF Inference.

        Args:
            cv_text: Full extracted CV text
            sections: List of detected sections
            rag_context: RAG context chunks

        Returns:
            Dict with 'raw_json', 'prompt_tokens', 'completion_tokens'
        """
        system_prompt = _build_system_prompt(rag_context)
        user_prompt = _build_user_prompt(cv_text, sections)

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            max_tokens=1500,
        )

        raw_json = response.choices[0].message.content

        # Estimate tokens (rough approximation)
        prompt_tokens = len(system_prompt) // 4 + len(user_prompt) // 4
        completion_tokens = len(raw_json) // 4

        # Increment Prometheus counters
        llm_tokens_counter.labels(
            provider="hf",
            model=self.model,
            type="prompt",
        ).inc(prompt_tokens)
        llm_tokens_counter.labels(
            provider="hf",
            model=self.model,
            type="completion",
        ).inc(completion_tokens)

        logger.info(
            "HF LLM suggestions generated",
            extra={
                "model": self.model,
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
            },
        )

        return {
            "raw_json": raw_json,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
        }

    def compare_cv(self, cv_text: str, jd_text: str) -> dict:
        """
        Compare CV against job description.

        Args:
            cv_text: Candidate CV text
            jd_text: Job description text

        Returns:
            Dict with comparison result and token counts
        """
        user_prompt = (
            f"Job Description:\n{jd_text[:2000]}\n\n"
            f"=== CANDIDATE CV ===\n{cv_text[:4000]}\n\n"
            "Compare the CV against the job description. "
            "Focus on technical skills, years of experience, and key qualifications. "
            "Return the JSON comparison."
        )

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": _COMPARISON_SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.7,
            max_tokens=1500,
        )

        raw_json = response.choices[0].message.content
        comparison_data = json.loads(raw_json)

        # Estimate tokens
        prompt_tokens = (len(_COMPARISON_SYSTEM_PROMPT) + len(user_prompt)) // 4
        completion_tokens = len(raw_json) // 4

        logger.info(
            "HF LLM CV comparison generated",
            extra={
                "model": self.model,
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
            },
        )

        return {
            "comparison": comparison_data,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
        }

    async def generate_suggestions_stream(
        self,
        prompt: str,
    ) -> AsyncGenerator[str, None]:
        """
        Generate streaming response for inline editing (future feature).

        Args:
            prompt: User prompt

        Yields:
            Text chunks as they arrive
        """
        # Note: InferenceClient streaming support is limited
        # This is a placeholder for future implementation
        raise NotImplementedError("Streaming not yet implemented with InferenceClient")

    def validate_output(self, raw_json: str) -> SuggestionsOutput:
        """
        Validate LLM JSON output against SuggestionsOutput Pydantic model.

        Args:
            raw_json: JSON string from LLM response

        Returns:
            Validated SuggestionsOutput instance

        Raises:
            ValidationError: If JSON doesn't match schema
            ValueError: If JSON is invalid or response is empty
        """
        if not raw_json or not raw_json.strip():
            raise ValueError("Empty JSON response from HF LLM")

        # Extract JSON from markdown code blocks if present
        json_str = raw_json.strip()
        if "```" in json_str:
            import re
            # Find the content between ``` markers
            match = re.search(r'```(?:json)?\s*(.*?)\s*```', json_str, re.DOTALL)
            if match:
                json_str = match.group(1).strip()
            else:
                # Fallback: find first { and count braces to find matching }
                start_idx = json_str.find('{')
                if start_idx != -1:
                    brace_count = 0
                    for i in range(start_idx, len(json_str)):
                        if json_str[i] == '{':
                            brace_count += 1
                        elif json_str[i] == '}':
                            brace_count -= 1
                            if brace_count == 0:
                                json_str = json_str[start_idx:i + 1]
                                break

        try:
            data = json.loads(json_str)
        except json.JSONDecodeError as e:
            logger.error(
                "HF LLM JSON parsing failed",
                extra={
                    "error": str(e),
                    "raw_length": len(raw_json),
                    "raw_preview": raw_json[:500] if raw_json else None,
                },
            )
            raise ValueError(f"Invalid JSON from HF LLM: {e}") from e

        return SuggestionsOutput.model_validate(data)
