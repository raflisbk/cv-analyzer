import json
from typing import Any

from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.logging import structured_logger as logger
from app.schemas.inline_edit import InlineEditResponse
from app.services.llm.koboi_llm_service import KoboiLLMService

_SYSTEM_PROMPT = """You are an expert CV editor and career coach.
Rewrite the selected CV text according to the user's prompt.


- Maintain professional tone and CV formatting conventions
- Keep the rewrite concise (same length or shorter than original)
- Preserve key facts: dates, metrics, company names, technologies
- Focus on clarity, impact, and action verbs
- Return ONLY the rewritten text, no explanations unless asked
- Do not include formatting like markdown or HTML
- If the prompt is unclear, make a reasonable best effort


The user is editing their CV to improve it for job applications.
Your rewrite should help them stand out to recruiters and hiring managers."""


def _build_user_prompt(
    selected_text: str, user_prompt: str, cv_context: dict[str, Any] | None
) -> str:
    parts = [f"Selected text from CV:\n{selected_text}"]

    if cv_context:

        if cv_context.get("scores"):
            parts.append(
                f"\nCurrent CV scores: {json.dumps(cv_context['scores'], indent=2)}"
            )

        if cv_context.get("skills"):
            skills_list = cv_context["skills"][:5]
            parts.append(f"\nKey skills in CV: {', '.join(skills_list)}")

    parts.append(f"\nUser instruction: {user_prompt}")
    parts.append("\nRewrite the selected text according to the instruction above.")

    return "\n".join(parts)


class InlineEditService:

    def __init__(self) -> None:
        self._llm = KoboiLLMService()
        logger.info("inline_edit_service_initialized", model=self._llm.model)

    @retry(stop=stop_after_attempt(2), wait=wait_exponential(min=1, max=4))
    def rewrite(
        self, selected_text: str, prompt: str, cv_context: dict[str, Any] | None
    ) -> InlineEditResponse:
        if not selected_text or not selected_text.strip():
            return InlineEditResponse(
                originalText=selected_text,
                rewrittenText="",
                error="No text selected for editing",
            )

        if len(selected_text) > 500:
            return InlineEditResponse(
                originalText=selected_text,
                rewrittenText="",
                error="Text selection too long. Please select 500 characters or less.",
            )

        try:
            user_prompt = _build_user_prompt(selected_text, prompt, cv_context)

            logger.info(
                "inline_edit_rewrite_generating",
                selected_length=len(selected_text),
            )

            rewritten_text = self._llm._chat(
                system_prompt=_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                temperature=0.7,
                max_tokens=300,
            )

            rewritten_text = rewritten_text.strip()
            if rewritten_text.startswith("```"):

                lines = rewritten_text.split("\n")
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines[-1].startswith("```"):
                    lines = lines[:-1]
                rewritten_text = "\n".join(lines).strip()

            logger.info(
                "inline_edit_rewrite_generated",
                original_length=len(selected_text),
                rewritten_length=len(rewritten_text),
            )

            return InlineEditResponse(
                originalText=selected_text,
                rewrittenText=rewritten_text,
                explanation=None,
            )

        except Exception as e:
            logger.error("inline_edit_rewrite_failed", error=str(e), exc_info=True)
            return InlineEditResponse(
                originalText=selected_text,
                rewrittenText="",
                error=f"Failed to generate rewrite: {e!s}",
            )
