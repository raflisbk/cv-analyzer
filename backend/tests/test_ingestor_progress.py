from unittest.mock import AsyncMock, MagicMock, patch

from app.services.rag.ingestor import ingest_cv_for_user

CHUNKS = ["a", "b", "c"]


def _session() -> MagicMock:
    session = MagicMock()
    existing = MagicMock()
    existing.fetchall.return_value = []
    session.execute = AsyncMock(return_value=existing)
    return session


async def _ingest(embed, calls: list) -> int:
    with (
        patch("app.services.rag.ingestor.chunk_text", return_value=CHUNKS),
        patch("app.services.rag.ingestor.get_rag_embedding", side_effect=embed),
    ):
        return await ingest_cv_for_user(
            "cv", "job-1", "user-1", _session(), lambda d, t: calls.append((d, t))
        )


async def test_progress_callback_reports_real_chunk_counts():
    calls: list[tuple[int, int]] = []
    saved = await _ingest(lambda chunk: [0.1], calls)
    assert saved == 3
    assert calls == [(0, 3), (1, 3), (2, 3), (3, 3)]


async def test_progress_callback_still_advances_when_a_chunk_fails():
    calls: list[tuple[int, int]] = []

    def embed(chunk: str):
        if chunk == "b":
            raise RuntimeError("embedding failed")
        return [0.1]

    saved = await _ingest(embed, calls)
    assert saved == 2
    assert calls[-1] == (3, 3)


async def test_ingest_without_callback_still_works():
    with (
        patch("app.services.rag.ingestor.chunk_text", return_value=CHUNKS),
        patch("app.services.rag.ingestor.get_rag_embedding", return_value=[0.1]),
    ):
        assert await ingest_cv_for_user("cv", "job-1", "user-1", _session()) == 3
