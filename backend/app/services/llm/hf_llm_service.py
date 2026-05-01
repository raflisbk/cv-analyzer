"""
HF Inference LLM service using Qwen2.5-7B-Instruct.
Free tier via Hugging Face Inference API.
Implements LLMService protocol for suggestions and comparison.
"""

import json
import re

from huggingface_hub import InferenceClient
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import get_settings
from app.core.logging import structured_logger as logger
from app.services.llm.metrics import llm_tokens_counter
from app.services.llm.protocol import SuggestionsOutput


# Model configuration — defaults to Qwen2-7B-Instruct via settings
settings = get_settings()
HF_LLM_MODEL = settings.CV_ANALYZER_LLM_MODEL


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


class HFLLMService:
    """LLMService implementation using HF Inference Qwen2.5-7B-Instruct."""

    def __init__(self) -> None:
        settings = get_settings()

        if not settings.CV_ANALYZER_HF_API_KEY:
            raise ValueError(
                "CV_ANALYZER_HF_API_KEY not configured. "
                "Please set it in your .env file."
            )

        self.client = InferenceClient(
            provider="hf-inference",
            api_key=settings.CV_ANALYZER_HF_API_KEY,
        )
        self.model = HF_LLM_MODEL

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
        Call Qwen2.5-7B-Instruct to generate structured CV suggestions.

        Args:
            cv_text: Full extracted CV text
            sections: List of detected sections from nlp_result
            rag_context: Concatenated RAG chunks relevant to this CV

        Returns:
            Dict with 'raw_json', 'prompt_tokens', 'completion_tokens'

        Raises:
            Exception: Re-raised after 3 retries
        """
        system_prompt = _build_system_prompt(rag_context)
        user_prompt = _build_user_prompt(cv_text, sections)

        # HF Inference uses text generation, not chat completions
        full_prompt = f"<|im_start|>system\n{system_prompt}<|im_end|>\n<|im_start|>user\n{user_prompt}<|im_end|>\n<|im_start|>assistant\n"

        response = self.client.text_generation(
            prompt=full_prompt,
            model=self.model,
            max_new_tokens=1500,
            temperature=0.7,
            do_sample=True,
            return_full_text=False,  # Only return the generated response
        )

        raw_json = response

        # Log raw response for debugging
        logger.info(
            "llm_raw_response",
            raw_length=len(raw_json) if raw_json else 0,
            raw_preview=(raw_json[:200] if raw_json else None),
        )

        # Validate response is not empty
        if not raw_json or not raw_json.strip():
            raise ValueError("HF LLM returned empty response")

        # Extract JSON from response (may have trailing text)
        raw_json = self._extract_json(raw_json)

        # Estimate tokens (Qwen2.5 uses similar tokenization to GPT)
        # Rough estimate: ~4 chars per token
        prompt_tokens = len(full_prompt) // 4
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
    def inline_rewrite(
        self, text: str, prompt: str, context: dict | None = None
    ) -> dict:
        """
        Rewrite a specific text snippet based on user prompt using Qwen2.5-7B-Instruct.
        """
        user_prompt = (
            f'Here is a snippet of text from a CV:\n"{text}"\n\n'
            f"Please rewrite this text according to the following instruction: {prompt}\n\n"
        )
        if context:
            user_prompt += f"Context about the CV: {json.dumps(context)[:500]}\n\n"

        user_prompt += "Return ONLY the rewritten text, nothing else."

        full_prompt = f"<|im_start|>system\nYou are an expert CV editor. You rewrite text cleanly and professionally.<|im_end|>\n<|im_start|>user\n{user_prompt}<|im_end|>\n<|im_start|>assistant\n"

        response = self.client.text_generation(
            prompt=full_prompt,
            model=self.model,
            max_new_tokens=500,
            temperature=0.7,
            do_sample=True,
            return_full_text=False,
        )

        rewritten = response.strip()

        # Sometimes models wrap output in quotes if we ask for text
        if rewritten.startswith('"') and rewritten.endswith('"'):
            rewritten = rewritten[1:-1]

        prompt_tokens = len(full_prompt) // 4
        completion_tokens = len(rewritten) // 4

        llm_tokens_counter.labels(provider="hf", model=self.model, type="prompt").inc(
            prompt_tokens
        )
        llm_tokens_counter.labels(
            provider="hf", model=self.model, type="completion"
        ).inc(completion_tokens)

        return {
            "rewritten_text": rewritten,
            "prompt_tokens": prompt_tokens,
            "completion_tokens": completion_tokens,
        }

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True,
    )
    def compare_cv(self, cv_text: str, jd_text: str) -> dict:
        """
        Compare CV against job description via Qwen2.5-7B-Instruct.

        Args:
            cv_text: Candidate CV text
            jd_text: Job description text

        Returns:
            Dict with keys: comparison (dict), prompt_tokens (int), completion_tokens (int)

        Raises:
            Exception: Re-raised after 3 retries
        """
        cv_truncated = cv_text[:4000]
        jd_truncated = jd_text[:2000]

        user_prompt = (
            f"Job Description:\n{jd_truncated}\n\n"
            f"=== CANDIDATE CV ===\n{cv_truncated}\n\n"
            "Compare the CV against the job description. "
            "Focus on technical skills, years of experience, and key qualifications. "
            "Return the JSON comparison."
        )

        # HF Inference uses text generation with Qwen chat template
        full_prompt = f"<|im_start|>system\n{_COMPARISON_SYSTEM_PROMPT}<|im_end|>\n<|im_start|>user\n{user_prompt}<|im_end|>\n<|im_start|>assistant\n"

        response = self.client.text_generation(
            prompt=full_prompt,
            model=self.model,
            max_new_tokens=1500,
            temperature=0.7,
            do_sample=True,
            return_full_text=False,
        )

        raw_json = self._extract_json(response)
        comparison_data = json.loads(raw_json)

        # Estimate tokens
        prompt_tokens = len(full_prompt) // 4
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

    def _extract_json(self, response: str) -> str:
        """
        Extract JSON from LLM response, handling markdown code blocks.

        Args:
            response: Raw response text from LLM

        Returns:
            Cleaned JSON string
        """
        response = response.strip()

        # Remove markdown code blocks
        if "```" in response:
            json_match = re.search(
                r"```(?:json)?\s*(\{.*?\})\s*```", response, re.DOTALL
            )
            if json_match:
                return json_match.group(1)

        # Find first { ... } pattern
        brace_match = re.search(r"\{.*\}", response, re.DOTALL)
        if brace_match:
            return brace_match.group(0)

        return response

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

        try:
            data = json.loads(raw_json)
        except json.JSONDecodeError as e:
            logger.error(
                "llm_json_parse_failed",
                error=str(e),
                raw_length=len(raw_json),
                raw_preview=raw_json[:500] if raw_json else None,
            )
            raise ValueError(f"Invalid JSON from HF LLM: {e}") from e

        return SuggestionsOutput.model_validate(data)
