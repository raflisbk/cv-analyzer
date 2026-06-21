"""rebuild knowledge_chunks for 3072-dim embeddings (KoboiLLM openai/text-embedding-3-large)

Previous migration 1304b62f8dd4 set the column to Vector(1024) for BAAI/bge-m3.
We have switched back to KoboiLLM with openai/text-embedding-3-large which produces
3072 dimensions. This migration rebuilds the table with the correct dimensions and
includes all columns added since: user_id FK, created_at, updated_at.

Revision ID: e2f3a4b5c6d7
Revises: d1e2f3a4b5c6
Create Date: 2026-06-02 00:03:00.000000

"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from pgvector.sqlalchemy import Vector


revision: str = "e2f3a4b5c6d7"
down_revision: Union[str, None] = "d1e2f3a4b5c6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_DIMS = 3072


def upgrade() -> None:
    op.drop_table("knowledge_chunks")

    op.create_table(
        "knowledge_chunks",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("source", sa.String(255), nullable=False),
        sa.Column("section_type", sa.String(100), nullable=True),
        sa.Column("embedding", Vector(_DIMS), nullable=False),
        sa.Column(
            "user_id",
            sa.dialects.postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id"),
            nullable=True,
        ),
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
    op.create_index("ix_knowledge_chunks_user_id", "knowledge_chunks", ["user_id"])

    # HNSW index — dimensions >2000 require halfvec cast
    op.execute(
        "CREATE INDEX ON knowledge_chunks "
        f"USING hnsw ((embedding::halfvec({_DIMS})) halfvec_cosine_ops)"
    )


def downgrade() -> None:
    op.drop_table("knowledge_chunks")

    op.create_table(
        "knowledge_chunks",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("source", sa.String(255), nullable=False),
        sa.Column("section_type", sa.String(100), nullable=True),
        sa.Column("embedding", Vector(1024), nullable=False),
        sa.Column(
            "user_id",
            sa.dialects.postgresql.UUID(as_uuid=True),
            sa.ForeignKey("users.id"),
            nullable=True,
        ),
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
    op.create_index("ix_knowledge_chunks_user_id", "knowledge_chunks", ["user_id"])
    op.execute(
        "CREATE INDEX ON knowledge_chunks USING hnsw (embedding vector_cosine_ops)"
    )
