from sqlalchemy import select

from app.core.logging import structured_logger as logger
from app.db.session import async_session_maker
from app.models.knowledge_chunk import KnowledgeChunk


async def retrieve_relevant_chunks(
    query_embedding: list[float],
    section_type: str | None = None,
    limit: int = 5,
) -> list[str]:
    try:
        async with async_session_maker() as session:
            stmt = (
                select(KnowledgeChunk.content)
                .order_by(KnowledgeChunk.embedding.cosine_distance(query_embedding))
                .limit(limit)
            )
            if section_type:
                stmt = stmt.where(KnowledgeChunk.section_type == section_type)

            result = await session.execute(stmt)
            chunks = [row[0] for row in result.fetchall()]
            logger.debug(
                "rag_chunks_retrieved",
                count=len(chunks),
                section_type=section_type,
            )
            return chunks
    except Exception as e:

        logger.warning(
            "rag_retrieval_failed",
            error=str(e),
            section_type=section_type,
        )
        return []
