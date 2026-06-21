from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.logging import structured_logger as logger
from app.services.scoring.embeddings import get_embedding

_MAX_RAG_CHARS = 20000


@retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True,
)
def get_rag_embedding(text: str) -> list[float]:
    logger.debug("rag_embedding_request", text_length=len(text))
    result = get_embedding(text[:_MAX_RAG_CHARS])
    logger.debug("rag_embedding_received", dims=len(result))
    return result
