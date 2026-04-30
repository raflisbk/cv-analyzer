"""
KnowledgeChunk model for RAG vector knowledge base.
Stores BAAI/bge-m3 embeddings (1024 dims) of career guide chunks.
"""

from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, Integer, String, Text

from app.db.base import Base


class KnowledgeChunk(Base):
    """A single chunk of career guide text with its embedding."""

    __tablename__ = "knowledge_chunks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    content = Column(Text, nullable=False)
    source = Column(String(255), nullable=False)  # e.g. "harvard_guide"
    section_type = Column(String(100), nullable=True)  # e.g. "experience", "skills"
    embedding = Column(Vector(1024), nullable=False)  # BAAI/bge-m3 dims
