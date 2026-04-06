"""add llm intelligence layer

Revision ID: bc028a15129a
Revises: c16445cc89d8
Create Date: 2026-04-06 14:30:53.161259

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

try:
    from pgvector.sqlalchemy import Vector
    PGVECTOR_AVAILABLE = True
except ImportError:
    PGVECTOR_AVAILABLE = False

# revision identifiers, used by Alembic.
revision: str = 'bc028a15129a'
down_revision: Union[str, None] = 'c16445cc89d8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Enable pgvector extension (MUST run before creating knowledge_chunks table)
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # 2. Add GENERATING to jobstatus enum (BEFORE 'COMPLETE' to preserve sort order)
    op.execute("ALTER TYPE jobstatus ADD VALUE IF NOT EXISTS 'GENERATING' BEFORE 'COMPLETE'")

    # 3. Add Phase 3 columns to jobs table
    op.add_column("jobs", sa.Column(
        "suggestions",
        postgresql.JSONB(astext_type=sa.Text()),
        nullable=True
    ))
    op.add_column("jobs", sa.Column(
        "llm_tokens_used",
        sa.Integer(),
        nullable=True
    ))

    # 4. Create knowledge_chunks table
    op.create_table(
        "knowledge_chunks",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("source", sa.String(255), nullable=False),
        sa.Column("section_type", sa.String(100), nullable=True),
        sa.Column("embedding", Vector(3072), nullable=False),
    )

    # 5. Create HNSW index using halfvec cast (required for >2000 dimensions)
    op.execute(
        "CREATE INDEX ON knowledge_chunks USING hnsw ((embedding::halfvec(3072)) halfvec_cosine_ops)"
    )


def downgrade() -> None:
    op.drop_table("knowledge_chunks")
    op.drop_column("jobs", "llm_tokens_used")
    op.drop_column("jobs", "suggestions")
    # Note: cannot remove enum value in PostgreSQL — do not attempt to remove GENERATING
    # Note: do NOT drop vector extension in downgrade (other apps may use it)
