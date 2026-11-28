import json
from unittest.mock import AsyncMock, MagicMock, patch

from app.api.v1.endpoints import stream as stream_endpoint

SCORES = {
    "overall": 70,
    "impact": 60,
    "clarity": 75,
    "relevance": 65,
    "completeness": 80,
}


async def _drain(status, scores, live_frames=()):
    fake_client = MagicMock()
    fake_pubsub = MagicMock()
    fake_pubsub.subscribe = AsyncMock()
    fake_pubsub.unsubscribe = AsyncMock()
    fake_client.pubsub.return_value = fake_pubsub
    fake_client.close = AsyncMock()
    db = MagicMock()
    db.execute = AsyncMock(
        return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=MagicMock()))
    )

    async def live_events(*_):
        for frame in live_frames:
            yield frame

    with (
        patch.object(
            stream_endpoint.redis, "from_url", AsyncMock(return_value=fake_client)
        ),
        patch.object(stream_endpoint, "check_job_access"),
        patch.object(
            stream_endpoint, "fetch_status_for", AsyncMock(return_value=status)
        ),
        patch.object(
            stream_endpoint, "fetch_scores_for", AsyncMock(return_value=scores)
        ),
        patch.object(stream_endpoint, "iter_job_events", live_events),
    ):
        response = await stream_endpoint.stream_job_progress("job-1", db, None)
        return [frame async for frame in response.body_iterator]


def _stages(frames):
    return [json.loads(frame[6:]).get("stage") for frame in frames]


async def test_late_subscriber_gets_scores_ready_when_scores_exist_and_job_is_running():
    frames = await _drain("analyzing", SCORES)
    assert _stages(frames) == [None, "scores_ready"]
    assert json.loads(frames[1][6:])["scores"] == SCORES


async def test_scores_ready_comes_before_live_events():
    live = ['data: {"stage": "grammar_check"}\n\n']
    frames = await _drain("generating", SCORES, live)
    assert _stages(frames) == [None, "scores_ready", "grammar_check"]


async def test_no_scores_means_no_scores_ready_frame():
    frames = await _drain("analyzing", None)
    assert _stages(frames) == [None]


async def test_terminal_job_gets_only_the_terminal_event_not_scores_ready():
    frames = await _drain("complete", SCORES)
    assert _stages(frames) == [None, "complete"]


async def test_failed_job_does_not_replay_scores_ready():
    frames = await _drain("failed", SCORES)
    assert "scores_ready" not in _stages(frames)
