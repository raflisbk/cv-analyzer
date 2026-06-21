from sqlalchemy import select

from app.core.logging import structured_logger as logger
from app.db.session import async_session_maker
from app.models.knowledge_chunk import KnowledgeChunk


async def retrieve_relevant_chunks(
    query_embedding: list[float],
    user_id: str | None = None,
    section_type: str | None = None,
    limit: int = 5,
) -> list[str]:
    """
    Hybrid RAG retrieval: global best practices + user's personal CV chunks.

    - Global chunks (user_id IS NULL): top 3 most relevant best practices
    - Personal chunks (user_id = user_id): top 2 most relevant user CV snippets
    - Falls back to global-only if user_id is None or no personal chunks found
    """
    try:
        async with async_session_maker() as session:
            global_limit = 3 if user_id else limit
            personal_limit = limit - global_limit if user_id else 0

            global_stmt = (
                select(KnowledgeChunk.content)
                .where(KnowledgeChunk.user_id.is_(None))
                .order_by(KnowledgeChunk.embedding.cosine_distance(query_embedding))
                .limit(global_limit)
            )
            if section_type:
                global_stmt = global_stmt.where(
                    KnowledgeChunk.section_type == section_type
                )

            global_result = await session.execute(global_stmt)
            global_chunks = [row[0] for row in global_result.fetchall()]

            personal_chunks: list[str] = []
            if user_id and personal_limit > 0:
                personal_stmt = (
                    select(KnowledgeChunk.content)
                    .where(KnowledgeChunk.user_id == user_id)
                    .order_by(KnowledgeChunk.embedding.cosine_distance(query_embedding))
                    .limit(personal_limit)
                )
                personal_result = await session.execute(personal_stmt)
                personal_chunks = [row[0] for row in personal_result.fetchall()]

            chunks = global_chunks + personal_chunks

            logger.debug(
                "rag_chunks_retrieved",
                global_count=len(global_chunks),
                personal_count=len(personal_chunks),
                user_id=user_id,
            )
            return chunks

    except Exception as e:
        logger.warning("rag_retrieval_failed", error=str(e))
        return []
