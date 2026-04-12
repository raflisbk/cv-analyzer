"""
OpenAI ChatCompletion LLM service with provider fallback support.
Uses gpt-4o-mini with JSON mode + Pydantic validation.
Integrates with ProviderManager for automatic fallback to Z AI after 3 failures.
"""

import json

from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import get_settings
from app.core.logging import structured_logger as logger
from app.services.llm.metrics import llm_tokens_counter
from app.services.llm.protocol import SuggestionsOutput
from app.services.llm.provider_manager import (
    ProviderType,
    get_provider_manager,
)
from app.services.scoring.embeddings import get_openai_client


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
          "after_text": "<rewritten version of original_text that implements this suggestion — a concrete improved example the user can use directly>"
        }}
      ]
    }}
  ]
}}

Rules:
- "high_impact" = significant improvement requiring effort
- "quick_win" = easy to fix, immediate improvement
- "action_verb" = replace weak verbs (e.g., managed → led, helped → drove)
- "impact_metric" = add quantifiable results (e.g., increased sales by 30%)
- "missing_section" = add absent but valuable section
- For each suggestion, you MUST provide "original_text": the EXACT text from the user's CV that this suggestion is improving (copy it verbatim)
- For each suggestion, you MUST provide "after_text": a concrete rewritten version of "original_text" that directly implements the suggestion (e.g., if suggestion is to add metrics, rewrite that sentence with plausible metrics)
- "original_text" + "after_text" enables a before/after comparison so users see exactly what to change
- Generate 2-4 suggestions per section, focusing on sections with most room for improvement
- Be specific: reference actual content from the CV text
"""

_USER_PROMPT_TEMPLATE = """CV Text:
{cv_text}

Detected Sections: {sections_json}

Generate improvement suggestions for this CV."""


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


class OpenAILLMService:
    """LLMService implementation using gpt-4o-mini with provider fallback support."""

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
        Call gpt-4o-mini with JSON mode to generate structured CV suggestions.

        Integrates with ProviderManager for automatic fallback to Z AI after failures.

        Args:
            cv_text: Full extracted CV text
            sections: List of detected sections from nlp_result
            rag_context: Concatenated RAG chunks relevant to this CV

        Returns:
            Dict with 'raw_json', 'prompt_tokens', 'completion_tokens'

        Raises:
            Exception: Re-raised after all retries exhausted
        """
        provider_manager = get_provider_manager()
        settings = get_settings()
        client = get_openai_client()

        system_prompt = _build_system_prompt(rag_context)
        user_prompt = _build_user_prompt(cv_text, sections)

        try:
            response = client.chat.completions.create(
                model=settings.CV_ANALYZER_LLM_MODEL,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                max_tokens=settings.CV_ANALYZER_LLM_MAX_TOKENS,
            )

            raw_json = response.choices[0].message.content
            usage = response.usage

            # Increment Prometheus counters
            llm_tokens_counter.labels(
                provider="openai",
                model=settings.CV_ANALYZER_LLM_MODEL,
                type="prompt",
            ).inc(usage.prompt_tokens)
            llm_tokens_counter.labels(
                provider="openai",
                model=settings.CV_ANALYZER_LLM_MODEL,
                type="completion",
            ).inc(usage.completion_tokens)

            # Record success with provider manager
            provider_manager.record_success(ProviderType.OPENAI)

            logger.info(
                "OpenAI LLM suggestions generated",
                extra={
                    "model": settings.CV_ANALYZER_LLM_MODEL,
                    "prompt_tokens": usage.prompt_tokens,
                    "completion_tokens": usage.completion_tokens,
                },
            )

            return {
                "raw_json": raw_json,
                "prompt_tokens": usage.prompt_tokens,
                "completion_tokens": usage.completion_tokens,
            }

        except Exception as e:
            # Record failure with provider manager
            provider_manager.record_failure(ProviderType.OPENAI, e)

            # Check if we should fallback to Z AI
            current_provider = provider_manager.get_current_provider()
            if current_provider == ProviderType.ZAI:
                logger.warning(
                    "OpenAI failed, falling back to Z AI",
                    extra={"error": str(e)},
                )
                # Import here to avoid circular dependency
                from app.services.llm.zai_service import ZAILLMService

                zai_service = ZAILLMService()
                return zai_service.generate_suggestions(cv_text, sections, rag_context)

            # Re-raise if fallback not triggered
            raise

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True,
    )
    def compare_cv(self, cv_text: str, jd_text: str) -> dict:
        """
        Compare CV against job description via gpt-4o-mini JSON mode.

        Integrates with ProviderManager for automatic fallback to Z AI after failures.

        Args:
            cv_text: Candidate CV text
            jd_text: Job description text

        Returns:
            Dict with keys: comparison (dict), prompt_tokens (int), completion_tokens (int)

        Raises:
            Exception: Re-raised after all retries exhausted
        """
        provider_manager = get_provider_manager()
        settings = get_settings()
        client = get_openai_client()

        cv_truncated = cv_text[:4000]
        jd_truncated = jd_text[:2000]

        system_prompt = (
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

        user_prompt = (
            f"Job Description:\n{jd_truncated}\n\n"
            f"=== CANDIDATE CV ===\n{cv_truncated}\n\n"
            "Compare the CV against the job description. "
            "Focus on technical skills, years of experience, and key qualifications. "
            "Return the JSON comparison."
        )

        try:
            response = client.chat.completions.create(
                model=settings.CV_ANALYZER_LLM_MODEL,
                response_format={"type": "json_object"},
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt},
                ],
                max_tokens=settings.CV_ANALYZER_LLM_MAX_TOKENS,
            )

            raw_json = response.choices[0].message.content
            usage = response.usage
            comparison_data = json.loads(raw_json)

            # Increment Prometheus counters
            llm_tokens_counter.labels(
                provider="openai",
                model=settings.CV_ANALYZER_LLM_MODEL,
                type="prompt",
            ).inc(usage.prompt_tokens)
            llm_tokens_counter.labels(
                provider="openai",
                model=settings.CV_ANALYZER_LLM_MODEL,
                type="completion",
            ).inc(usage.completion_tokens)

            # Record success with provider manager
            provider_manager.record_success(ProviderType.OPENAI)

            logger.info(
                "OpenAI CV comparison generated",
                extra={
                    "model": settings.CV_ANALYZER_LLM_MODEL,
                    "prompt_tokens": usage.prompt_tokens,
                    "completion_tokens": usage.completion_tokens,
                },
            )

            return {
                "comparison": comparison_data,
                "prompt_tokens": usage.prompt_tokens,
                "completion_tokens": usage.completion_tokens,
            }

        except Exception as e:
            # Record failure with provider manager
            provider_manager.record_failure(ProviderType.OPENAI, e)

            # Check if we should fallback to Z AI
            current_provider = provider_manager.get_current_provider()
            if current_provider == ProviderType.ZAI:
                logger.warning(
                    "OpenAI failed, falling back to Z AI",
                    extra={"error": str(e)},
                )
                # Import here to avoid circular dependency
                from app.services.llm.zai_service import ZAILLMService

                zai_service = ZAILLMService()
                return zai_service.compare_cv(cv_text, jd_text)

            # Re-raise if fallback not triggered
            raise

    def validate_output(self, raw_json: str) -> SuggestionsOutput:
        """
        Validate LLM JSON output against SuggestionsOutput Pydantic model.

        Args:
            raw_json: JSON string from LLM response

        Returns:
            Validated SuggestionsOutput instance

        Raises:
            ValidationError: If JSON doesn't match schema
        """
        data = json.loads(raw_json)
        return SuggestionsOutput.model_validate(data)
