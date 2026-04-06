"""
RAG embedding function using text-embedding-3-large per D-11, RAG-05.
SEPARATE from scoring/embeddings.py which uses text-embedding-3-small (1536 dims).
text-embedding-3-large produces 3072-dim vectors for higher quality retrieval.
"""

from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.logging import structured_logger as logger
from app.services.scoring.embeddings import get_openai_client


_MAX_RAG_CHARS = 20000  # text-embedding-3-large: ~8191 tokens max, ~4 chars/token


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True,
)
def get_rag_embedding(text: str) -> list[float]:
    """
    Get text-embedding-3-large embedding (3072 dimensions) for RAG per D-11.
    DIFFERENT from get_embedding() in scoring/embeddings.py (text-embedding-3-small, 1536 dims).
    Using wrong model causes dimension mismatch when inserting/querying knowledge_chunks.
    """
    client = get_openai_client()
    response = client.embeddings.create(
        model="text-embedding-3-large",
        input=text[:_MAX_RAG_CHARS],
    )
    result = response.data[0].embedding  # 3072 floats
    logger.debug("RAG embedding retrieved", extra={"dims": len(result)})
    return result
