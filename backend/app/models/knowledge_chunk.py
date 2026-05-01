from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, Integer, String, Text

from app.db.base import Base


class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    content = Column(Text, nullable=False)
    source = Column(String(255), nullable=False)
    section_type = Column(String(100), nullable=True)
    embedding = Column(Vector(1024), nullable=False)
