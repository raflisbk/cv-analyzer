from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import structured_logger as logger
from app.models.knowledge_chunk import KnowledgeChunk
from app.services.rag.chunker import chunk_text
from app.services.rag.embeddings import get_rag_embedding


async def ingest_cv_for_user(
    cv_text: str,
    job_id: str,
    user_id: str,
    session: AsyncSession,
) -> int:
    """
    Chunk and embed CV text, store in knowledge_chunks with user_id.
    Idempotent — deletes existing chunks for this job_id before re-inserting.
    Returns number of chunks saved.
    """
    source = f"job:{job_id}"

    existing = await session.execute(
        select(KnowledgeChunk.id).where(KnowledgeChunk.source == source)
    )
    if existing.fetchall():
        await session.execute(
            delete(KnowledgeChunk).where(KnowledgeChunk.source == source)
        )
        logger.debug("ingestor_replaced_existing", job_id=job_id)

    chunks = chunk_text(cv_text)
    if not chunks:
        logger.warning("ingestor_no_chunks", job_id=job_id)
        return 0

    saved = 0
    for chunk in chunks:
        try:
            embedding = get_rag_embedding(chunk)
            session.add(
                KnowledgeChunk(
                    content=chunk,
                    source=source,
                    section_type=None,
                    embedding=embedding,
                    user_id=user_id,
                )
            )
            saved += 1
        except Exception as e:
            logger.warning("ingestor_chunk_failed", job_id=job_id, error=str(e))

    logger.info("ingestor_done", job_id=job_id, user_id=user_id, chunks=saved)
    return saved
