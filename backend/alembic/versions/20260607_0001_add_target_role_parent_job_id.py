"""add target_role and parent_job_id to jobs

Revision ID: a1b2c3d4e5f6
Revises: f3a4b5c6d7e8
Create Date: 2026-06-07
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "a1b2c3d4e5f6"
down_revision = "f3a4b5c6d7e8"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "jobs",
        sa.Column("target_role", sa.String(100), nullable=True),
    )
    op.add_column(
        "jobs",
        sa.Column(
            "parent_job_id",
            UUID(as_uuid=True),
            sa.ForeignKey("jobs.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )
    op.create_index("ix_jobs_parent_job_id", "jobs", ["parent_job_id"])
    op.create_index("ix_jobs_target_role", "jobs", ["target_role"])


def downgrade() -> None:
    op.drop_index("ix_jobs_target_role", table_name="jobs")
    op.drop_index("ix_jobs_parent_job_id", table_name="jobs")
    op.drop_column("jobs", "parent_job_id")
    op.drop_column("jobs", "target_role")
