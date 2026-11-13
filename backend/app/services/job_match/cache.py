import hashlib
import json

import redis

from app.core.config import get_settings
from app.schemas.job_match import JobMatchData

CACHE_VERSION = "v1"
CACHE_TTL_SECONDS = 24 * 60 * 60


def cache_key(job_id: str, jd_text: str, cv_text: str) -> str:
    normalized_jd = " ".join(jd_text.casefold().split())
    jd_hash = hashlib.sha256(normalized_jd.encode()).hexdigest()
    cv_hash = hashlib.sha256(cv_text.encode()).hexdigest()
    return f"job_match:{CACHE_VERSION}:{job_id}:{jd_hash}:{cv_hash}"


def cached_match(key: str) -> JobMatchData | None:
    try:
        client = redis.from_url(get_settings().CV_ANALYZER_REDIS_URL)
        raw = client.get(key)
        return JobMatchData.model_validate_json(raw) if raw else None
    except Exception:
        return None


def store_match(key: str, match: JobMatchData) -> None:
    try:
        client = redis.from_url(get_settings().CV_ANALYZER_REDIS_URL)
        client.setex(key, CACHE_TTL_SECONDS, json.dumps(match.model_dump()))
    except Exception:
        pass
