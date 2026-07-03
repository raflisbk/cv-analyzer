"""add_pdf_workspace_columns_to_jobs

Revision ID: a3f8c9d12b45
Revises: f9f23d731d78
Create Date: 2026-04-14 00:01:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'a3f8c9d12b45'
down_revision: Union[str, None] = 'f9f23d731d78'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Phase 13: additive columns for PDF-first workspace
    # cv_document: stores structured document model (CRDT-03)
    op.add_column('jobs', sa.Column(
        'cv_document',
        postgresql.JSONB(astext_type=sa.Text()),
        nullable=True
    ))
    # suggestion_anchors: stores PDF coordinate anchors for suggestions
    op.add_column('jobs', sa.Column(
        'suggestion_anchors',
        postgresql.JSONB(astext_type=sa.Text()),
        nullable=True
    ))
    # yjs_snapshot: binary Yjs document snapshot for offline sync
    op.add_column('jobs', sa.Column(
        'yjs_snapshot',
        sa.LargeBinary(),
        nullable=True
    ))


def downgrade() -> None:
    op.drop_column('jobs', 'yjs_snapshot')
    op.drop_column('jobs', 'suggestion_anchors')
    op.drop_column('jobs', 'cv_document')
