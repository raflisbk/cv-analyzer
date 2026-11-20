import uuid

from app.services.versions_restore.chain import full_chain
from tests.test_versions_restore_endpoint import chain_of


def test_full_chain_extends_to_tip_from_middle():
    chain = chain_of(uuid.uuid4(), 4)
    by_id = {job.id: job for job in chain}
    assert full_chain(chain[1], by_id) == chain


def test_full_chain_of_single_job():
    chain = chain_of(uuid.uuid4(), 1)
    assert full_chain(chain[0], {chain[0].id: chain[0]}) == chain
