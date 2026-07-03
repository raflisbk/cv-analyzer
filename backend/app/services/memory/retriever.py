from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import structured_logger as logger
from app.db.session import async_session_maker
from app.models.job_memory_chunk import JobMemoryChunk
from app.services.rag.embeddings import get_rag_embedding


async def retrieve_job_memory(
    job_id: str,
    query: str,
    limit: int = 5,
    content_types: list[str] | None = None,
    session: AsyncSession | None = None,
) -> list[str]:
    """Cosine-similarity retrieval over a single job's memory chunks.

    Uses exact search (sequential scan) via `.cosine_distance()` — fine for the
    small per-job datasets (~20-50 chunks) this table holds. The HNSW index is
    there for when a job's memory grows large enough to need it.
    """
    try:
        query_embedding = get_rag_embedding(query)

        async def _run(sess: AsyncSession) -> list[str]:
            stmt = (
                select(JobMemoryChunk.content)
                .where(JobMemoryChunk.job_id == job_id)
                .order_by(JobMemoryChunk.embedding.cosine_distance(query_embedding))
                .limit(limit)
            )
            if content_types:
                stmt = stmt.where(JobMemoryChunk.content_type.in_(content_types))
            result = await sess.execute(stmt)
            return [row[0] for row in result.fetchall()]

        if session is not None:
            return await _run(session)

        async with async_session_maker() as new_session:
            return await _run(new_session)

    except Exception as e:
        logger.warning("job_memory_retrieval_failed", job_id=job_id, error=str(e))
        return []
