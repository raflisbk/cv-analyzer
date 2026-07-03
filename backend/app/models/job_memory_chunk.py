import uuid

from pgvector.sqlalchemy import Vector
from sqlalchemy import Column, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.core.config import get_settings
from app.db.base import Base
from app.models.base import TimestampMixin


def _get_embedding_dimensions() -> int:
    return get_settings().CV_ANALYZER_EMBEDDING_DIMENSIONS


class JobMemoryChunk(Base, TimestampMixin):
    """Per-job activity memory — cv_section, analysis, edit, chat — for contextual retrieval."""

    __tablename__ = "job_memory_chunks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(
        UUID(as_uuid=True),
        ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )
    content_type = Column(String(20), nullable=False, index=True)
    content = Column(Text, nullable=False)
    extra = Column(JSONB, nullable=True)
    embedding = Column(Vector(_get_embedding_dimensions()), nullable=False)

    job = relationship("Job", backref="memory_chunks")
    user = relationship("User")
