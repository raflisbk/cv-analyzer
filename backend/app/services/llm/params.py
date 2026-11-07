from typing import Any

from app.core.config import get_settings


def reasoning_params() -> dict[str, Any]:
    effort = get_settings().CV_ANALYZER_LLM_REASONING_EFFORT
    return {"reasoning_effort": effort} if effort else {}
