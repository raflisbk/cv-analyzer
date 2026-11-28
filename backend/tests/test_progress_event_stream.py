import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.api.v1.endpoints import stream as stream_endpoint
from app.services.progress.event_stream import (
    HEARTBEAT_FRAME,
    iter_job_events,
    terminal_event_frame,
)


class FakeClock:
    def __init__(self) -> None:
        self.now = 0.0

    def __call__(self) -> float:
        return self.now


class FakePubSub:
    def __init__(self, clock: FakeClock, script: list) -> None:
        self.clock = clock
        self.script = list(script)

    async def get_message(self, ignore_subscribe_messages=True, timeout=1.0):
        self.clock.now += timeout
        item = self.script.pop(0) if self.script else None
        if item is None:
            return None
        return {"type": "message", "data": json.dumps(item).encode()}


def _status(*values):
    queue = list(values)

    async def fetch() -> str | None:
        return queue.pop(0) if queue else None

    return fetch


async def _collect(script, fetch, max_frames=50):
    clock = FakeClock()
    pubsub = FakePubSub(clock, script)
    frames = []
    async for frame in iter_job_events(pubsub, "job-1", fetch, clock):
        frames.append(frame)
        if len(frames) >= max_frames:
            break
    return frames


async def test_heartbeat_is_emitted_when_no_message_arrives():
    frames = await _collect([None] * 25, _status(), max_frames=2)
    assert frames[0] == HEARTBEAT_FRAME
    assert len(frames) == 2


async def test_heartbeat_is_a_data_event_the_browser_can_observe():
    assert HEARTBEAT_FRAME.startswith("data:")
    assert json.loads(HEARTBEAT_FRAME[6:]) == {"type": "heartbeat"}


async def test_pubsub_messages_are_forwarded_until_terminal_then_closed():
    script = [
        {"stage": "scoring", "percentage": 62},
        {"stage": "complete", "percentage": 100},
        {"stage": "never", "percentage": 0},
    ]
    frames = await _collect(script, _status())
    assert [json.loads(f[6:])["stage"] for f in frames] == ["scoring", "complete"]


async def test_database_fallback_emits_terminal_event_when_message_was_lost():
    frames = await _collect([None] * 10, _status(None, "complete"))
    terminal = json.loads(frames[-1][6:])
    assert terminal["stage"] == "complete"
    assert terminal["percentage"] == 100
    assert terminal["step"] == 5


async def test_database_fallback_reports_failed_jobs():
    frames = await _collect([None] * 10, _status("failed"))
    assert json.loads(frames[-1][6:])["stage"] == "failed"


async def test_database_is_not_rechecked_before_the_interval():
    fetch = AsyncMock(return_value=None)
    await _collect([None, None, {"stage": "complete"}], fetch)
    fetch.assert_not_called()


async def test_non_terminal_database_status_keeps_the_stream_open():
    frames = await _collect([None] * 30, _status("analyzing", "analyzing"), 3)
    assert all(frame == HEARTBEAT_FRAME for frame in frames)


async def test_malformed_pubsub_payload_does_not_close_the_stream():
    clock = FakeClock()
    pubsub = FakePubSub(clock, [])
    pubsub.script = [None]

    async def bad_message(**_):
        clock.now += 1
        return {"type": "message", "data": b"not json"}

    pubsub.get_message = bad_message
    stream = iter_job_events(pubsub, "job-1", _status(), clock)
    assert await anext(stream) == "data: not json\n\n"
    assert await anext(stream) == "data: not json\n\n"


async def _drain_endpoint(status: str | None):
    fake_client = MagicMock()
    fake_pubsub = MagicMock()
    fake_pubsub.subscribe = AsyncMock()
    fake_pubsub.unsubscribe = AsyncMock()
    fake_client.pubsub.return_value = fake_pubsub
    fake_client.close = AsyncMock()
    job = MagicMock()
    db = MagicMock()
    db.execute = AsyncMock(
        return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=job))
    )
    with (
        patch.object(
            stream_endpoint.redis, "from_url", AsyncMock(return_value=fake_client)
        ),
        patch.object(stream_endpoint, "check_job_access"),
        patch.object(
            stream_endpoint, "fetch_status_for", AsyncMock(return_value=status)
        ),
    ):
        response = await stream_endpoint.stream_job_progress("job-1", db, None)
        return [frame async for frame in response.body_iterator], response


async def test_terminal_event_on_connect_still_works():
    frames, _ = await _drain_endpoint("complete")
    assert json.loads(frames[0][6:])["type"] == "connected"
    assert frames[1] == terminal_event_frame("job-1", "complete")
    assert len(frames) == 2


@pytest.mark.parametrize("status", ["complete", "failed"])
async def test_terminal_frame_names_the_status(status):
    payload = json.loads(terminal_event_frame("job-1", status)[6:])
    assert payload["stage"] == status
    assert payload["percentage"] == 100


async def test_stream_response_opts_out_of_proxy_compression_buffering():
    _, response = await _drain_endpoint("complete")
    assert response.media_type == "text/event-stream"
    assert "no-transform" in response.headers["cache-control"]
