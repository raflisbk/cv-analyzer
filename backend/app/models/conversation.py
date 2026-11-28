import uuid

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import false

from app.db.base import Base
from app.models.base import TimestampMixin


class Conversation(Base, TimestampMixin):
    __tablename__ = "conversations"
    __table_args__ = (
        Index("ix_conversations_user_id_deleted_at", "user_id", "deleted_at"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id", ondelete="SET NULL"))
    title = Column(String(120), nullable=False, default="New chat")
    pinned = Column(Boolean, nullable=False, default=False, server_default=false())
    pinned_at = Column(DateTime(timezone=True))
    deleted_at = Column(DateTime(timezone=True))
    job = relationship("Job")
