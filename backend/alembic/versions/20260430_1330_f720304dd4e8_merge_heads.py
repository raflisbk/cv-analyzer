"""merge heads

Revision ID: f720304dd4e8
Revises: 1304b62f8dd4, b7e2f1a03c89
Create Date: 2026-04-30 13:30:33.515757

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f720304dd4e8'
down_revision: Union[str, None] = ('1304b62f8dd4', 'b7e2f1a03c89')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
