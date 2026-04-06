"""
KnowledgeChunk model for RAG vector knowledge base per RAG-05, D-11.
Stores text-embedding-3-large embeddings (3072 dims) of career guide chunks.
"""

from sqlalchemy import Column, Integer, String, Text
from pgvector.sqlalchemy import Vector

from app.db.base import Base


class KnowledgeChunk(Base):
    """A single chunk of career guide text with its embedding per RAG-05."""

    __tablename__ = "knowledge_chunks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    content = Column(Text, nullable=False)
    source = Column(String(255), nullable=False)       # e.g. "harvard_guide"
    section_type = Column(String(100), nullable=True)  # e.g. "experience", "skills"
    embedding = Column(Vector(3072), nullable=False)   # text-embedding-3-large dims
