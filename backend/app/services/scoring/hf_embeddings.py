"""
Hugging Face Inference API embeddings service (fallback).
Uses BGE-M3 model via HF Inference API with huggingface_hub library.
"""

import numpy as np
from huggingface_hub import InferenceClient

from app.core.config import get_settings
from app.core.logging import structured_logger as logger


HF_MODEL_NAME = "BAAI/bge-m3"


def get_client() -> InferenceClient:
    """
    Get HuggingFace InferenceClient instance.

    Returns:
        InferenceClient instance

    Raises:
        ValueError: If HF API key not configured
    """
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
    """
    Get embedding vector from Hugging Face Inference API.

    Args:
        text: Input text to embed

    Returns:
        List of float values representing the embedding vector

    Raises:
        ValueError: If HF API key not configured
        Exception: If API request fails
    """
    client = get_client()

    logger.debug(
        "Requesting HF embedding",
        extra={"text_length": len(text), "model": HF_MODEL_NAME},
    )

    # Use feature_extraction to get embeddings
    result = client.feature_extraction(text, model=HF_MODEL_NAME)

    # HF returns numpy array or list[list[float]]
    if isinstance(result, np.ndarray):
        # Convert numpy array to list
        embedding = result.tolist()
    elif isinstance(result, list) and len(result) > 0 and isinstance(result[0], list):
        # Handle nested list [[0.1, 0.2, ...]]
        embedding = result[0]
    elif isinstance(result, list):
        # Handle flat list [0.1, 0.2, ...]
        embedding = result
    else:
        raise ValueError(f"Unexpected HF API response format: {type(result)}")

    logger.debug(
        "HF embedding received",
        extra={"embedding_dim": len(embedding)},
    )

    return embedding


def cosine_similarity(vec1: list[float], vec2: list[float]) -> float:
    """
    Calculate cosine similarity between two vectors.

    Args:
        vec1: First vector
        vec2: Second vector

    Returns:
        Cosine similarity score (0-1)
    """
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
    """
    Score a CV dimension by comparing text embeddings with anchor embeddings.

    Args:
        text: Full CV text
        anchors: List of reference texts for this dimension

    Returns:
        Integer score 0-100
    """
    text_embedding = get_embedding(text)

    # Get similarity scores for all anchors
    similarities = []
    for anchor in anchors:
        try:
            anchor_embedding = get_embedding(anchor)
            similarity = cosine_similarity(text_embedding, anchor_embedding)
            similarities.append(similarity)
        except Exception as e:
            logger.warning(
                "Failed to get anchor embedding",
                extra={"anchor": anchor[:50], "error": str(e)},
            )

    if not similarities:
        logger.warning("No valid similarities calculated, returning default score")
        return 50

    # Average similarity and convert to 0-100 scale
    avg_similarity = sum(similarities) / len(similarities)
    score = int(avg_similarity * 100)

    # Clamp to 0-100
    score = max(0, min(100, score))

    logger.info(
        "HF embedding dimension scored",
        extra={
            "dimension": anchors[0][:20] if anchors else "unknown",
            "score": score,
            "avg_similarity": avg_similarity,
            "num_anchors": len(anchors),
        },
    )

    return score
