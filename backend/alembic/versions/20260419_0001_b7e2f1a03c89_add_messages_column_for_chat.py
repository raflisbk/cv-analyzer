"""add messages column for chat

Revision ID: b7e2f1a03c89
Revises: a3f8c9d12b45
Create Date: 2026-04-19 00:01:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'b7e2f1a03c89'
down_revision: Union[str, None] = 'a3f8c9d12b45'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Phase 16: Chat message persistence - conversation history stored as JSONB
    op.add_column('jobs', sa.Column(
        'messages',
        postgresql.JSONB(astext_type=sa.Text()),
        nullable=True,
        server_default='[]'
    ))


def downgrade() -> None:
    op.drop_column('jobs', 'messages')
