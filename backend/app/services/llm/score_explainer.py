"""
Service to generate AI reasoning/explanations for CV scores using HF Inference.
"""

import json
from typing import Dict
from app.services.llm.hf_openai_llm_service import HFOpenAILLMService
from app.core.logging import structured_logger as logger

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
        self.llm = HFOpenAILLMService()

    def explain_scores(self, cv_text: str, scores: Dict[str, int]) -> Dict[str, str]:
        """
        Generate explanations for the provided scores.
        """
        user_prompt = f"CV Text:\n{cv_text[:4000]}\n\nNumerical Scores:\n{json.dumps(scores, indent=2)}\n\nExplain these scores."

        try:
            response = self.llm.client.chat.completions.create(
                model=self.llm.model,
                messages=[
                    {"role": "system", "content": _SCORE_EXPLAINER_SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                temperature=0.3, # Lower temperature for consistency
                max_tokens=800,
            )

            raw_json = response.choices[0].message.content
            
            # Use the existing validation logic from HFOpenAILLMService if possible, 
            # but since we have a different schema, we'll do basic extraction.
            json_str = raw_json.strip()
            if "```" in json_str:
                import re
                match = re.search(r'```(?:json)?\s*(.*?)\s*```', json_str, re.DOTALL)
                if match:
                    json_str = match.group(1).strip()
            
            data = json.loads(json_str)
            reasonings = data.get("reasonings", {})
            
            logger.info("Score explanations generated successfully")
            return reasonings

        except Exception as e:
            logger.error(f"Failed to generate score explanations: {e}")
            return {
                "clarity": "Explanation unavailable.",
                "impact": "Explanation unavailable.",
                "completeness": "Explanation unavailable.",
                "relevance": "Explanation unavailable."
            }
