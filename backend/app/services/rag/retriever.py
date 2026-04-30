"""
RAG retrieval using pgvector cosine distance.
Retrieves top-K chunks from knowledge_chunks table by cosine similarity.
section_type filter improves relevance for specific CV sections.
"""

from sqlalchemy import select

from app.core.logging import structured_logger as logger
from app.db.session import async_session_maker
from app.models.knowledge_chunk import KnowledgeChunk


async def retrieve_relevant_chunks(
    query_embedding: list[float],
    section_type: str | None = None,
    limit: int = 5,
) -> list[str]:
    """
    Retrieve top-K chunks by cosine similarity using pgvector <=> operator.

    Args:
        query_embedding: 3072-dim vector from get_rag_embedding().
        section_type: Optional CV section filter (e.g. "experience", "skills").
                      If provided, only chunks tagged with this section_type are queried.
        limit: Max chunks to return (default 5).

    Returns:
        List of content strings for injection into LLM system prompt.
        Returns [] on retrieval failure (non-fatal).
    """
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
                "RAG chunks retrieved",
                extra={"count": len(chunks), "section_type": section_type},
            )
            return chunks
    except Exception as e:
        # D-18: RAG failure is non-fatal — log warning and return empty list
        # llm_suggest_task will proceed with LLM call without RAG context
        logger.warning(
            "RAG retrieval failed, proceeding without context",
            extra={"error": str(e), "section_type": section_type},
        )
        return []
