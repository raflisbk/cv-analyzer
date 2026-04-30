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

from app.db.base import Base
from app.models.base import TimestampMixin


class JobStatus(str, enum.Enum):
    """Job status enum."""

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
    """Job model."""

    __tablename__ = "jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    status = Column(Enum(JobStatus), default=JobStatus.PENDING, nullable=False)
    file_id = Column(String(255), nullable=False)  # R2 object key
    stages = Column(JSON, default=dict)  # Track completion of each stage
    error = Column(String(1000), nullable=True)  # Error message if failed
    retry_count = Column(Integer, default=0, nullable=False)
    file_metadata = Column(JSON, default=dict)  # File metadata
    result = Column(JSON, nullable=True)

    # Phase 2 NLP analysis results (JSONB for PostgreSQL operators) per D-24
    nlp_result = Column(JSONB, nullable=True)  # sections + entities from spaCy
    scores = Column(JSONB, nullable=True)  # 5 score values (overall + 4 dims)
    grammar_issues = Column(JSONB, nullable=True)  # list of grammar/spell issues
    ats_checks = Column(JSONB, nullable=True)  # list of ATS check results

    # Phase 3: LLM suggestions per D-20
    suggestions = Column(
        JSONB, nullable=True
    )  # list[SuggestionCard] or None (LLM failed)
    llm_tokens_used = Column(
        Integer, nullable=True
    )  # total tokens (prompt + completion)

    # Phase 4: Comparison results per D-C9
    comparison_result = Column(JSONB, nullable=True)  # LLM JSON output
    comparison_status = Column(
        String(20), nullable=True
    )  # pending|comparing|complete|failed
    jd_text = Column(Text, nullable=True)  # raw JD text

    # Foreign key to JobRole table (Phase 4 comparison feature)
    # Links analyzed CV to pre-seeded job roles for comparison
    # Example: jd_role_id connects to JobRole(title="Software Engineer", seniority="Senior")
    # Phase 17 preservation: anchor for future "job finding" feature
    # No code changes — documentation only (JOBMATCH-02)
    jd_role_id = Column(
        UUID(as_uuid=True),
        ForeignKey("job_roles.id"),
        nullable=True,
    )

    # Phase 12: workspace draft per-section Tiptap JSON (D-10, D-11, D-12)
    workspace_draft = Column(JSONB, nullable=True)

    # Phase 13: PDF-first workspace columns
    cv_document = Column(JSONB, nullable=True)  # structured document model (CRDT-03)
    suggestion_anchors = Column(JSONB, nullable=True)  # PDF coordinate anchors
    yjs_snapshot = Column(sa.LargeBinary, nullable=True)  # binary Yjs snapshot

    # Phase 16: Chat conversation history
    messages = Column(JSONB, nullable=True, default=list)
