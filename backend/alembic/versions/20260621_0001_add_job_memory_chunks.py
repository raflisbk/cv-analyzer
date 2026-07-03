"""add job_memory_chunks table

Per-job activity memory (cv_section, analysis, edit, chat) for contextual
retrieval by inline edit and chat. Cascades on job delete; scoped per job_id,
not per user, to keep retrieval fast and relevant.

Revision ID: f6e5d4c3b2a1
Revises: a1b2c3d4e5f6
Create Date: 2026-06-21 00:01:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from pgvector.sqlalchemy import Vector


revision: str = "f6e5d4c3b2a1"
down_revision: Union[str, None] = "a1b2c3d4e5f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_DIMS = 3072


def upgrade() -> None:
    op.create_table(
        "job_memory_chunks",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "job_id",
            sa.dialects.postgresql.UUID(as_uuid=True),
            sa.ForeignKey("jobs.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "user_id",
            sa.dialects.postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id"),
            nullable=True,
        ),
        sa.Column("content_type", sa.String(20), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("extra", sa.dialects.postgresql.JSONB(), nullable=True),
        sa.Column("embedding", Vector(_DIMS), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_index(
        "ix_job_memory_chunks_job_id", "job_memory_chunks", ["job_id"]
    )
    op.create_index(
        "ix_job_memory_chunks_user_id", "job_memory_chunks", ["user_id"]
    )
    op.create_index(
        "ix_job_memory_chunks_content_type", "job_memory_chunks", ["content_type"]
    )

    # HNSW index — dimensions >2000 require halfvec cast (same pattern as knowledge_chunks)
    op.execute(
        "CREATE INDEX ON job_memory_chunks "
        f"USING hnsw ((embedding::halfvec({_DIMS})) halfvec_cosine_ops)"
    )


def downgrade() -> None:
    op.drop_table("job_memory_chunks")
