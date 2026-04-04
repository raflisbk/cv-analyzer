import enum
import uuid
from sqlalchemy import Column, String, Integer, Enum, JSON
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base
from app.models.base import TimestampMixin


class JobStatus(str, enum.Enum):
    """Job status enum per D-46"""
    PENDING = "pending"
    UPLOADING = "uploading"
    EXTRACTING = "extracting"
    PARSING = "parsing"
    ANALYZING = "analyzing"
    COMPLETE = "complete"
    FAILED = "failed"


class Job(Base, TimestampMixin):
    """Job model per D-45, D-46, D-47
    
    Tracks CV analysis jobs through the complete pipeline with detailed status tracking.
    """
    __tablename__ = "jobs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    status = Column(Enum(JobStatus), default=JobStatus.PENDING, nullable=False)
    file_id = Column(String(255), nullable=False)  # R2 object key
    stages = Column(JSON, default=dict)  # Track completion of each stage
    error = Column(String(1000), nullable=True)  # Error message if failed
    retry_count = Column(Integer, default=0, nullable=False)  # Retry tracking per D-16
    file_metadata = Column(JSON, default=dict)  # File metadata (name, size, type) per D-21
    result = Column(JSON, nullable=True)  # Analysis results (JSONB) per D-47
