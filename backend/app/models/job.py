import enum
import uuid

import sqlalchemy as sa
from sqlalchemy import (
    JSON,
    Column,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from app.db.base import Base
from app.models.base import TimestampMixin


class JobStatus(str, enum.Enum):
    PENDING = "pending"
    UPLOADING = "uploading"
    EXTRACTING = "extracting"
    PARSING = "parsing"
    ANALYZING = "analyzing"
    GENERATING = "generating"
    COMPARING = "comparing"
    COMPLETE = "complete"
    FAILED = "failed"


class Job(Base, TimestampMixin):
    __tablename__ = "jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    status = Column(Enum(JobStatus), default=JobStatus.PENDING, nullable=False)
    file_id = Column(String(255), nullable=False)
    stages = Column(JSON, default=dict)
    error = Column(String(1000), nullable=True)
    retry_count = Column(Integer, default=0, nullable=False)
    file_metadata = Column(JSON, default=dict)
    result = Column(JSON, nullable=True)

    nlp_result = Column(JSONB, nullable=True)
    scores = Column(JSONB, nullable=True)
    grammar_issues = Column(JSONB, nullable=True)
    ats_checks = Column(JSONB, nullable=True)

    suggestions = Column(JSONB, nullable=True)
    llm_tokens_used = Column(Integer, nullable=True)

    comparison_result = Column(JSONB, nullable=True)
    comparison_status = Column(String(20), nullable=True)
    jd_text = Column(Text, nullable=True)

    jd_role_id = Column(
        UUID(as_uuid=True),
        ForeignKey("job_roles.id"),
        nullable=True,
    )

    target_role = Column(String(100), nullable=True, index=True)
    parent_job_id = Column(
        UUID(as_uuid=True),
        ForeignKey("jobs.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    parent_job = relationship("Job", remote_side="Job.id", foreign_keys="Job.parent_job_id")

    workspace_draft = Column(JSONB, nullable=True)
    cv_document = Column(JSONB, nullable=True)
    suggestion_anchors = Column(JSONB, nullable=True)
    yjs_snapshot = Column(sa.LargeBinary, nullable=True)

    messages = Column(JSONB, nullable=True, default=list)

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )
    user = relationship("User", back_populates="jobs")
