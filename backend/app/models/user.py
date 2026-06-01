import uuid

from sqlalchemy import Boolean, Column, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.models.base import TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    google_id = Column(String(255), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=True)
    picture = Column(String(1000), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

    jobs = relationship("Job", back_populates="user", lazy="select")
    knowledge_chunks = relationship(
        "KnowledgeChunk", back_populates="user", lazy="select"
    )
