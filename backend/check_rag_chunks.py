"""Cek apakah RAG knowledge chunks sudah ada di database"""

import asyncio
import sys

# Add backend to path
from pathlib import Path


sys.path.insert(0, str(Path(__file__).parent))

from sqlalchemy import select

from app.db.session import async_session_maker
from app.models.knowledge_chunk import KnowledgeChunk


async def check_rag_chunks():
    async with async_session_maker() as session:
        result = await session.execute(select(KnowledgeChunk).limit(10))
        chunks = result.scalars().all()

        if not chunks:
            print("❌ Knowledge chunks KOSONG!")
            print("\nJalankan seed:")
            print("  python scripts/seed_knowledge.py")
            return

        print(f"✅ Found {len(chunks)} knowledge chunks (top 10):\n")

        for i, chunk in enumerate(chunks, 1):
            print(f"[{i}] Source: {chunk.source}")
            print(f"    Section: {chunk.section_type or 'N/A'}")
            print(f"    Content: {chunk.content[:100]}...")
            print()


if __name__ == "__main__":
    import sys

    # Windows fix: use SelectorEventLoop
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(check_rag_chunks())
