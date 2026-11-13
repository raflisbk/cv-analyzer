import uuid

from sqlalchemy import CheckConstraint, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB, UUID

from app.db.base import Base


class ConversationMessage(Base):
    __tablename__ = "conversation_messages"
    __table_args__ = (CheckConstraint("role IN ('user', 'assistant')"),)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(
        UUID(as_uuid=True),
        ForeignKey("conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role = Column(String(12), nullable=False)
    text = Column(Text, nullable=False)
    actions = Column(JSONB)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
