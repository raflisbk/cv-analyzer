"""fix_rag_embedding_dimension_bge_m3

Revision ID: 1304b62f8dd4
Revises: a3f8c9d12b45
Create Date: 2026-04-13 18:15:56.035663

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

try:
    from pgvector.sqlalchemy import Vector
    PGVECTOR_AVAILABLE = True
except ImportError:
    PGVECTOR_AVAILABLE = False

# revision identifiers, used by Alembic.
revision: str = '1304b62f8dd4'
down_revision: Union[str, None] = 'a3f8c9d12b45'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop old knowledge_chunks table (3072 dims for OpenAI text-embedding-3-large)
    op.drop_table("knowledge_chunks", if_exists=True)

    # Recreate with 1024 dims for BAAI/bge-m3 embeddings
    op.create_table(
        "knowledge_chunks",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("source", sa.String(255), nullable=False),
        sa.Column("section_type", sa.String(100), nullable=True),
        sa.Column("embedding", Vector(1024), nullable=False),
    )

    # Create HNSW index for cosine similarity search
    op.execute(
        "CREATE INDEX ON knowledge_chunks USING hnsw (embedding vector_cosine_ops)"
    )


def downgrade() -> None:
    # Revert to 3072 dims (OpenAI text-embedding-3-large)
    op.drop_table("knowledge_chunks", if_exists=True)

    op.create_table(
        "knowledge_chunks",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("source", sa.String(255), nullable=False),
        sa.Column("section_type", sa.String(100), nullable=True),
        sa.Column("embedding", Vector(3072), nullable=False),
    )

    # Recreate HNSW index with halfvec cast for >2000 dims
    op.execute(
        "CREATE INDEX ON knowledge_chunks USING hnsw ((embedding::halfvec(3072)) halfvec_cosine_ops)"
    )
