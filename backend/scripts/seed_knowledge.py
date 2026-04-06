"""
One-time RAG knowledge base seed script per D-12, RAG-04.
Fetches public career guides, chunks them, embeds with text-embedding-3-large,
stores in knowledge_chunks table.

Usage:
    conda activate sbk-cv-analyzer
    cd backend
    python scripts/seed_knowledge.py

Prerequisites:
    - docker compose up -d (PostgreSQL with pgvector must be running)
    - alembic upgrade head (knowledge_chunks table must exist)
    - CV_ANALYZER_OPENAI_API_KEY set in .env
"""

import asyncio
import sys
import time
from pathlib import Path

# Add backend to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

import requests  # noqa: E402
from sqlalchemy import text  # noqa: E402

from app.db.session import async_session_maker  # noqa: E402
from app.models.knowledge_chunk import KnowledgeChunk  # noqa: E402
from app.services.rag.chunker import chunk_text  # noqa: E402
from app.services.rag.embeddings import get_rag_embedding  # noqa: E402


# Public career guide URLs for knowledge base per RAG-04
KNOWLEDGE_SOURCES = [
    {
        "url": "https://careerservices.fas.harvard.edu/resources/bullet-points/",
        "source": "harvard_guide",
        "section_type": "experience",
    },
    {
        "url": "https://www.indeed.com/career-advice/resumes-cover-letters/how-to-make-a-resume",
        "source": "indeed_guide",
        "section_type": None,  # General CV advice
    },
    {
        "url": "https://www.indeed.com/career-advice/resumes-cover-letters/action-verbs-to-make-your-resume-stand-out",
        "source": "indeed_action_verbs",
        "section_type": "experience",
    },
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; CV-Analyzer-Bot/1.0; research purposes)"
}


def fetch_text(url: str) -> str:
    """Fetch URL and extract readable text (strip HTML tags simply)."""
    import re

    try:
        response = requests.get(url, headers=HEADERS, timeout=15)
        response.raise_for_status()
        raw = re.sub(r"<[^>]+>", " ", response.text)
        raw = re.sub(r"\s+", " ", raw)
        return raw.strip()
    except Exception as e:
        print(f"  WARNING: Failed to fetch {url}: {e}")
        return ""


async def seed() -> None:
    """Main seed function: fetch → chunk → embed → store."""
    print("Starting RAG knowledge base seeding...")

    async with async_session_maker() as session:
        # Check if already seeded
        result = await session.execute(text("SELECT COUNT(*) FROM knowledge_chunks"))
        count = result.scalar()
        if count and count > 0:
            print(f"Knowledge base already has {count} chunks. Skipping seed.")
            print("To re-seed, run: DELETE FROM knowledge_chunks; then re-run this script.")
            return

    total_chunks = 0

    for source_info in KNOWLEDGE_SOURCES:
        url = source_info["url"]
        print(f"\nFetching: {url}")
        page_text = fetch_text(url)

        if not page_text:
            print(f"  SKIPPED: No text extracted from {url}")
            continue

        chunks = chunk_text(page_text, chunk_size=500, overlap=50)
        print(f"  Chunked into {len(chunks)} segments")

        for i, chunk in enumerate(chunks):
            try:
                embedding = get_rag_embedding(chunk)
                async with async_session_maker() as session:
                    knowledge_chunk = KnowledgeChunk(
                        content=chunk,
                        source=source_info["source"],
                        section_type=source_info.get("section_type"),
                        embedding=embedding,
                    )
                    session.add(knowledge_chunk)
                    await session.commit()
                total_chunks += 1
                if (i + 1) % 10 == 0:
                    print(f"  Stored {i + 1}/{len(chunks)} chunks...")
                time.sleep(0.1)  # Rate limit: 10 req/s OpenAI embeddings API
            except Exception as e:
                print(f"  ERROR on chunk {i}: {e}")
                continue

    print(f"\nSeeding complete. Total chunks stored: {total_chunks}")


if __name__ == "__main__":
    asyncio.run(seed())
