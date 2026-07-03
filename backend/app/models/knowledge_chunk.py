from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.config import get_settings
from app.db.base import Base
from app.models.base import TimestampMixin


def _get_embedding_dimensions() -> int:
    return get_settings().CV_ANALYZER_EMBEDDING_DIMENSIONS


class KnowledgeChunk(Base, TimestampMixin):
    __tablename__ = "knowledge_chunks"

    id = Column(Integer, primary_key=True, autoincrement=True)
    content = Column(Text, nullable=False)
    source = Column(String(255), nullable=False)
    section_type = Column(String(100), nullable=True)
    embedding = Column(Vector(_get_embedding_dimensions()), nullable=False)

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )
    user = relationship("User", back_populates="knowledge_chunks")
