import json

from app.core.logging import structured_logger as logger
from app.services.llm.hf_llm_service import HFLLMService, _extract_json


_SCORE_EXPLAINER_SYSTEM_PROMPT = """You are an expert CV reviewer.
Given a CV's text and its numerical scores (0-100) across four dimensions, provide a concise explanation (summarization) for WHY each score was given.

Dimensions:
1. Clarity: Professional formatting, readability, and consistent structure.
2. Impact: Use of action verbs and quantifiable results (metrics).
3. Completeness: Presence of essential sections (Contact, Experience, Education, Skills).
4. Relevance: Semantic alignment with industry-standard professional keywords.

Your explanations should be specific to the CV content and the score provided. be encouraging but honest.

Return ONLY valid JSON matching this exact schema:
{
  "reasonings": {
    "clarity": "<explanation string>",
    "impact": "<explanation string>",
    "completeness": "<explanation string>",
    "relevance": "<explanation string>"
  }
}
"""


class ScoreExplainerService:
    def __init__(self):
        self.llm = HFLLMService()

    def explain_scores(self, cv_text: str, scores: dict[str, int]) -> dict[str, str]:
        user_prompt = f"CV Text:\n{cv_text[:4000]}\n\nNumerical Scores:\n{json.dumps(scores, indent=2)}\n\nExplain these scores."

        try:
            raw_json = self.llm._chat(
                system_prompt=_SCORE_EXPLAINER_SYSTEM_PROMPT,
                user_prompt=user_prompt,
                temperature=0.3,
                max_tokens=800,
            )

            json_str = _extract_json(raw_json)

            data = json.loads(json_str)
            reasonings = data.get("reasonings", {})

            logger.info("score_explanations_generated")
        except Exception as e:
            logger.error("score_explanations_failed", error=str(e), exc_info=True)
            return {
                "clarity": "Explanation unavailable.",
                "impact": "Explanation unavailable.",
                "completeness": "Explanation unavailable.",
                "relevance": "Explanation unavailable.",
            }
        else:
            return reasonings
