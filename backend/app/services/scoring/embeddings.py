from openai import OpenAI

from app.core.config import get_settings
from app.core.logging import structured_logger as logger


def _get_client() -> OpenAI:
    settings = get_settings()

    if not settings.CV_ANALYZER_KOBOI_API_KEY:
        raise ValueError(
            "KoboiLLM API key not configured. "
            "Set CV_ANALYZER_KOBOI_API_KEY in your .env file."
        )

    return OpenAI(
        base_url=settings.CV_ANALYZER_KOBOI_BASE_URL,
        api_key=settings.CV_ANALYZER_KOBOI_API_KEY,
        timeout=60.0,
    )


def get_embeddings(texts: list[str]) -> list[list[float]]:
    """Batch embed multiple texts in a single API call."""
    settings = get_settings()
    client = _get_client()
    model = settings.CV_ANALYZER_EMBEDDING_MODEL

    logger.debug("batch_embedding_request", count=len(texts), model=model)

    response = client.embeddings.create(input=texts, model=model)
    # Sort by index to guarantee order matches input
    return [item.embedding for item in sorted(response.data, key=lambda x: x.index)]


def get_embedding(text: str) -> list[float]:
    """Get embedding for a single text. Use get_embeddings() for batches."""
    return get_embeddings([text])[0]


def cosine_similarity(vec1: list[float], vec2: list[float]) -> float:
    import math

    if len(vec1) != len(vec2):
        raise ValueError(f"Vector dimensions don't match: {len(vec1)} vs {len(vec2)}")

    dot_product = sum(v1 * v2 for v1, v2 in zip(vec1, vec2, strict=False))
    magnitude1 = math.sqrt(sum(v * v for v in vec1))
    magnitude2 = math.sqrt(sum(v * v for v in vec2))

    if magnitude1 == 0 or magnitude2 == 0:
        return 0.0

    return dot_product / (magnitude1 * magnitude2)


def score_dimension(text: str, anchors: list[str]) -> int:
    text_embedding = get_embedding(text)

    similarities = []
    for anchor in anchors:
        try:
            anchor_embedding = get_embedding(anchor)
            similarity = cosine_similarity(text_embedding, anchor_embedding)
            similarities.append(similarity)
        except Exception as e:
            logger.warning(
                "anchor_embedding_failed",
                anchor=anchor[:50],
                error=str(e),
            )

    if not similarities:
        logger.warning("no_valid_similarities")
        return 50

    avg_similarity = sum(similarities) / len(similarities)
    score = int(avg_similarity * 100)

    score = max(0, min(100, score))

    logger.info(
        "dimension_scored",
        dimension=anchors[0][:20] if anchors else "unknown",
        score=score,
        avg_similarity=avg_similarity,
        num_anchors=len(anchors),
    )

    return score
