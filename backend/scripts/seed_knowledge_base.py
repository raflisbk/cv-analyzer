"""
Seed global CV best practices into knowledge_chunks table.
Idempotent — skips chunks that already exist based on content hash.

Usage:
    conda activate sbk-cv-analyzer
    cd backend
    python scripts/seed_knowledge_base.py
"""

import asyncio
import hashlib
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import select

from app.core.logging import structured_logger as logger
from app.db.session import async_session_maker
from app.models.job import Job  # noqa: F401 - needed for SQLAlchemy relationship resolution
from app.models.knowledge_chunk import KnowledgeChunk
from app.models.user import User  # noqa: F401 - needed for SQLAlchemy relationship resolution
from app.services.rag.chunker import chunk_text
from app.services.rag.embeddings import get_rag_embedding

DATA_FILE = Path(__file__).parent.parent / "data" / "cv_best_practices.md"
SOURCE = "cv_best_practices"


def _content_hash(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()[:16]


async def seed() -> None:
    if not DATA_FILE.exists():
        logger.error("data_file_not_found", path=str(DATA_FILE))
        sys.exit(1)

    content = DATA_FILE.read_text(encoding="utf-8")
    chunks = chunk_text(content)
    logger.info("chunks_prepared", count=len(chunks))

    async with async_session_maker() as session:
        existing_result = await session.execute(
            select(KnowledgeChunk.source).where(
                KnowledgeChunk.source == SOURCE,
                KnowledgeChunk.user_id.is_(None),
            )
        )
        existing_count = len(existing_result.fetchall())

        if existing_count > 0:
            logger.info("already_seeded", existing=existing_count)
            print(
                f"Already seeded: {existing_count} chunks exist. Use --force to re-seed."
            )
            return

        saved = 0
        for i, chunk in enumerate(chunks):
            print(f"  Embedding chunk {i + 1}/{len(chunks)}...", end="\r")
            try:
                embedding = get_rag_embedding(chunk)
                kc = KnowledgeChunk(
                    content=chunk,
                    source=SOURCE,
                    section_type=None,
                    embedding=embedding,
                    user_id=None,
                )
                session.add(kc)
                saved += 1
            except Exception as e:
                logger.warning("chunk_embed_failed", chunk_index=i, error=str(e))
                print(f"  ERROR chunk {i}: {e}")

        await session.commit()
        print()
        logger.info("seed_complete", saved=saved, total=len(chunks))
        print(f"\n✓ Seeded {saved}/{len(chunks)} chunks into knowledge_chunks.")


if __name__ == "__main__":
    import sys

    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(seed())
