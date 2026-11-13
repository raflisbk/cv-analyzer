import json

import httpx
from pydantic import ValidationError

from app.core.config import get_settings
from app.schemas.job_match import Extraction
from app.services.job_match.prompts import SYSTEM_PROMPT, build_prompt
from app.services.llm.params import reasoning_params
from app.services.llm.untrusted import UNTRUSTED_DATA_RULE


class JobMatchError(Exception):
    pass


def _request(prompt: str) -> str:
    settings = get_settings()
    with httpx.Client(timeout=60.0) as client:
        response = client.post(
            f"{settings.CV_ANALYZER_KOBOI_BASE_URL}/chat/completions",
            headers={"Authorization": f"Bearer {settings.CV_ANALYZER_KOBOI_API_KEY}"},
            json={
                "model": settings.CV_ANALYZER_LLM_MODEL,
                "messages": [
                    {
                        "role": "system",
                        "content": f"{UNTRUSTED_DATA_RULE} {SYSTEM_PROMPT}",
                    },
                    {"role": "user", "content": prompt},
                ],
                "max_tokens": 2400,
                **reasoning_params(),
            },
        )
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]


def extract_requirements(jd_text: str, cv_text: str) -> Extraction:
    prompt = build_prompt(jd_text, cv_text)
    for attempt in range(2):
        try:
            return Extraction.model_validate(json.loads(_request(prompt)))
        except (json.JSONDecodeError, ValidationError) as exc:
            if attempt:
                raise JobMatchError("Unable to analyze this job description.") from exc
        except Exception as exc:
            raise JobMatchError("Unable to analyze this job description.") from exc
    raise JobMatchError("Unable to analyze this job description.")
