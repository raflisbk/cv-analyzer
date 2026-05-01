"""
RAG embedding function using HF Inference BGE-M3.
Uses BAAI/bge-m3 model for high-quality retrieval (1024 dimensions).
"""

from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.logging import structured_logger as logger
from app.services.scoring.hf_embeddings import get_embedding


_MAX_RAG_CHARS = 20000  # BGE-M3 token limit


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True,
)
def get_rag_embedding(text: str) -> list[float]:
    """
    Get BGE-M3 embedding (1024 dimensions) for RAG.

    Args:
        text: Input text to embed

    Returns:
        List of float values (1024 dimensions)

    Raises:
        Exception: If HF API request fails after retries
    """
    logger.debug("rag_embedding_request", text_length=len(text))
    result = get_embedding(text[:_MAX_RAG_CHARS])
    logger.debug("rag_embedding_received", dims=len(result))
    return result
