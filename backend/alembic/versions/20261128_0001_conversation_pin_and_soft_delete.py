"""Add pin and soft delete columns to conversations.

Revision ID: 20261128_0001
Revises: 20261114_0002
"""

import sqlalchemy as sa
from alembic import op

revision = "20261128_0001"
down_revision = "20261114_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "conversations",
        sa.Column("pinned", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.add_column("conversations", sa.Column("pinned_at", sa.DateTime(timezone=True)))
    op.add_column("conversations", sa.Column("deleted_at", sa.DateTime(timezone=True)))
    op.create_index(
        "ix_conversations_user_id_deleted_at",
        "conversations",
        ["user_id", "deleted_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_conversations_user_id_deleted_at", table_name="conversations")
    op.drop_column("conversations", "deleted_at")
    op.drop_column("conversations", "pinned_at")
    op.drop_column("conversations", "pinned")
