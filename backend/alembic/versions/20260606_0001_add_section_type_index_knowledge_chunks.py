"""add section_type index to knowledge_chunks for filtered RAG queries

Revision ID: f3a4b5c6d7e8
Revises: e2f3a4b5c6d7
Create Date: 2026-06-06 00:01:00.000000

"""

from typing import Sequence, Union

from alembic import op

revision: str = "f3a4b5c6d7e8"
down_revision: Union[str, None] = "e2f3a4b5c6d7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index(
        "ix_knowledge_chunks_section_type",
        "knowledge_chunks",
        ["section_type"],
    )


def downgrade() -> None:
    op.drop_index("ix_knowledge_chunks_section_type", table_name="knowledge_chunks")
