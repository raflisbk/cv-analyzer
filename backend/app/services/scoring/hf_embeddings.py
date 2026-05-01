import numpy as np
from huggingface_hub import InferenceClient

from app.core.config import get_settings
from app.core.logging import structured_logger as logger

HF_MODEL_NAME = "BAAI/bge-m3"


def get_client() -> InferenceClient:
    settings = get_settings()

    if not settings.CV_ANALYZER_HF_API_KEY:
        raise ValueError(
            "Hugging Face API key not configured. "
            "Set CV_ANALYZER_HF_API_KEY in your .env file."
        )

    return InferenceClient(
        provider="hf-inference",
        api_key=settings.CV_ANALYZER_HF_API_KEY,
    )


def get_embedding(text: str) -> list[float]:
    client = get_client()

    logger.debug(
        "hf_embedding_request",
        text_length=len(text),
        model=HF_MODEL_NAME,
    )

    result = client.feature_extraction(text, model=HF_MODEL_NAME)

    if isinstance(result, np.ndarray):
        embedding = result.tolist()
    elif isinstance(result, list) and len(result) > 0 and isinstance(result[0], list):
        embedding = result[0]
    elif isinstance(result, list):
        embedding = result
    else:
        raise ValueError(f"Unexpected HF API response format: {type(result)}")

    logger.debug(
        "hf_embedding_received",
        embedding_dim=len(embedding),
    )

    return embedding


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
        "hf_dimension_scored",
        dimension=anchors[0][:20] if anchors else "unknown",
        score=score,
        avg_similarity=avg_similarity,
        num_anchors=len(anchors),
    )

    return score
