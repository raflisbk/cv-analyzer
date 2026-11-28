import importlib.util
from pathlib import Path
from unittest.mock import patch

PATH = (
    Path(__file__).resolve().parents[1]
    / "alembic/versions/20261128_0001_conversation_pin_and_soft_delete.py"
)


def load():
    spec = importlib.util.spec_from_file_location("pin_migration", PATH)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_upgrade_adds_columns_and_index():
    module = load()
    with patch.object(module, "op") as op:
        module.upgrade()
    added = [call.args[1].name for call in op.add_column.call_args_list]
    assert added == ["pinned", "pinned_at", "deleted_at"]
    assert op.create_index.call_args.args[2] == ["user_id", "deleted_at"]


def test_downgrade_drops_what_upgrade_added():
    module = load()
    with patch.object(module, "op") as op:
        module.downgrade()
    dropped = [call.args[1] for call in op.drop_column.call_args_list]
    assert sorted(dropped) == ["deleted_at", "pinned", "pinned_at"]
    op.drop_index.assert_called_once()


def test_migration_chains_after_conversations_table():
    assert load().down_revision == "20261114_0002"
