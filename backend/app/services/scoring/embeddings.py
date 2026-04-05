"""
OpenAI embeddings client and cosine similarity utilities per D-07, D-09, D-10.
Uses text-embedding-3-small model with 3x exponential backoff retry.
"""

import numpy as np
from openai import OpenAI
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import get_settings
from app.core.logging import structured_logger as logger


_MAX_TEXT_CHARS = 8000  # Safety cap to stay under token limit (Pitfall 7)

_client: OpenAI | None = None


def get_openai_client() -> OpenAI:
    """Lazy-load OpenAI client as singleton"""
    global _client  # noqa: PLW0603
    if _client is None:
        settings = get_settings()
        _client = OpenAI(api_key=settings.CV_ANALYZER_OPENAI_API_KEY)
    return _client


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True,  # Re-raise after all retries exhausted per D-10
)
def get_embedding(text: str) -> list[float]:
    """
    Get text-embedding-3-small embedding with 3x exponential backoff retry per D-10.

    Args:
        text: Input text. Truncated to 8000 chars to stay under token limit (Pitfall 7).

    Returns:
        List of 1536 float values (text-embedding-3-small dimensions).

    Raises:
        Exception: Re-raised after 3 retries exhausted (caller marks job as failed per D-10).
    """
    client = get_openai_client()
    safe_text = text[:_MAX_TEXT_CHARS]

    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=safe_text,
    )
    logger.debug("OpenAI embedding retrieved", extra={"text_length": len(safe_text)})
    return response.data[0].embedding


def cosine_similarity(a: list[float], b: list[float]) -> float:
    """
    Compute cosine similarity between two embedding vectors.

    Returns:
        Float in [0, 1]. Returns 0.0 if either vector is zero.
    """
    a_arr = np.array(a, dtype=np.float64)
    b_arr = np.array(b, dtype=np.float64)
    norm_a = float(np.linalg.norm(a_arr))
    norm_b = float(np.linalg.norm(b_arr))
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a_arr, b_arr) / (norm_a * norm_b))


def score_dimension(cv_text: str, anchor_texts: list[str]) -> int:
    """
    Score a single CV dimension (0-100) by comparing to ideal anchor templates.

    Process:
    1. Get embedding for cv_text
    2. Get embedding for each anchor
    3. Compute cosine similarity for each (cv, anchor) pair
    4. Average the similarities and scale to 0-100

    Note: No caching per D-09. Each call makes fresh API requests.

    Args:
        cv_text: CV text or section text to score
        anchor_texts: List of 4-6 ideal CV text templates for this dimension

    Returns:
        Integer score 0-100
    """
    cv_embedding = get_embedding(cv_text)
    similarities: list[float] = []

    for anchor in anchor_texts:
        anchor_embedding = get_embedding(anchor)
        sim = cosine_similarity(cv_embedding, anchor_embedding)
        similarities.append(sim)

    if not similarities:
        return 0

    avg_similarity = sum(similarities) / len(similarities)
    return min(100, max(0, int(avg_similarity * 100)))
