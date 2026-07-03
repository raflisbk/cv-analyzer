import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.logging import structured_logger as logger
from app.models.job_memory_chunk import JobMemoryChunk
from app.services.rag.embeddings import get_rag_embedding

_MAX_CHUNK_CHARS = 3000


async def _add_chunk(
    session: AsyncSession,
    job_id: str,
    user_id: str | None,
    content_type: str,
    content: str,
    extra: dict[str, Any] | None = None,
) -> None:
    text = content.strip()[:_MAX_CHUNK_CHARS]
    if not text:
        return
    embedding = get_rag_embedding(text)
    chunk = JobMemoryChunk(
        id=uuid.uuid4(),
        job_id=job_id,
        user_id=user_id,
        content_type=content_type,
        content=text,
        extra=extra,
        embedding=embedding,
    )
    session.add(chunk)


async def index_cv_sections(
    job_id: str,
    user_id: str | None,
    sections: list[dict],
    session: AsyncSession,
) -> None:
    """Index each detected CV section as a memory chunk (content_type='cv_section')."""
    try:
        for section in sections:
            section_type = section.get("type", "unknown")
            text = section.get("text") or section.get("content") or ""
            if not text.strip():
                continue
            await _add_chunk(
                session,
                job_id,
                user_id,
                "cv_section",
                text,
                extra={"section_type": section_type},
            )
        await session.commit()
        logger.info("job_memory_cv_sections_indexed", job_id=job_id, count=len(sections))
    except Exception as e:
        logger.warning("job_memory_index_cv_sections_failed", job_id=job_id, error=str(e))


async def index_analysis_summary(
    job_id: str,
    user_id: str | None,
    scores: dict | None,
    suggestions: list | None,
    session: AsyncSession,
) -> None:
    """Index a natural-language summary of the analysis results (content_type='analysis')."""
    try:
        parts = []
        if scores:
            parts.append(
                "CV scores — "
                f"overall: {scores.get('overall')}, impact: {scores.get('impact')}, "
                f"clarity: {scores.get('clarity')}, completeness: {scores.get('completeness')}, "
                f"relevance: {scores.get('relevance')}"
            )
        if suggestions:
            for card in suggestions[:10]:
                section = card.get("section", "unknown") if isinstance(card, dict) else card.section
                items = card.get("suggestions", []) if isinstance(card, dict) else card.suggestions
                for item in items:
                    text = item.get("text") if isinstance(item, dict) else item.text
                    if text:
                        parts.append(f"[{section}] {text}")

        if not parts:
            return

        summary = "\n".join(parts)
        await _add_chunk(session, job_id, user_id, "analysis", summary)
        await session.commit()
        logger.info("job_memory_analysis_indexed", job_id=job_id)
    except Exception as e:
        logger.warning("job_memory_index_analysis_failed", job_id=job_id, error=str(e))


async def index_edit(
    job_id: str,
    user_id: str | None,
    original_text: str,
    rewritten_text: str,
    session: AsyncSession,
) -> None:
    """Index an inline-edit rewrite as a memory chunk (content_type='edit')."""
    try:
        content = f"Original: {original_text}\nRewritten: {rewritten_text}"
        await _add_chunk(session, job_id, user_id, "edit", content)
        await session.commit()
        logger.info("job_memory_edit_indexed", job_id=job_id)
    except Exception as e:
        logger.warning("job_memory_index_edit_failed", job_id=job_id, error=str(e))


async def index_chat_message(
    job_id: str,
    user_id: str | None,
    role: str,
    content: str,
    session: AsyncSession,
) -> None:
    """Index a single chat turn as a memory chunk (content_type='chat')."""
    try:
        text = f"{role}: {content}"
        await _add_chunk(session, job_id, user_id, "chat", text, extra={"role": role})
        await session.commit()
        logger.info("job_memory_chat_indexed", job_id=job_id, role=role)
    except Exception as e:
        logger.warning("job_memory_index_chat_failed", job_id=job_id, error=str(e))
