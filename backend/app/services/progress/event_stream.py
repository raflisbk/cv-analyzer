import json
import time
from collections.abc import AsyncIterator, Awaitable, Callable

from app.services.progress.stages import build_progress_payload

TERMINAL_STAGE_NAMES = {"complete", "failed"}
HEARTBEAT_INTERVAL_SECONDS = 10.0
STATUS_RECHECK_INTERVAL_SECONDS = 5.0
POLL_TIMEOUT_SECONDS = 1.0
HEARTBEAT_FRAME = ": ping\n\n"

StatusFetcher = Callable[[], Awaitable[str | None]]


def sse_frame(data: str) -> str:
    return f"data: {data}\n\n"


def terminal_event_frame(job_id: str, status: str) -> str:
    payload = build_progress_payload(job_id, status, f"Analysis {status}.", 100)
    return sse_frame(json.dumps(payload))


def _stage_of(data: str) -> str | None:
    try:
        parsed = json.loads(data)
    except ValueError:
        return None
    return parsed.get("stage") if isinstance(parsed, dict) else None


async def iter_job_events(
    pubsub,
    job_id: str,
    fetch_status: StatusFetcher,
    clock: Callable[[], float] = time.monotonic,
) -> AsyncIterator[str]:
    last_sent = last_status_check = clock()
    while True:
        message = await pubsub.get_message(
            ignore_subscribe_messages=True, timeout=POLL_TIMEOUT_SECONDS
        )
        now = clock()
        if message and message.get("type") == "message":
            data = message["data"].decode("utf-8")
            yield sse_frame(data)
            last_sent = now
            if _stage_of(data) in TERMINAL_STAGE_NAMES:
                return
            continue
        if now - last_status_check >= STATUS_RECHECK_INTERVAL_SECONDS:
            last_status_check = now
            status = await fetch_status()
            if status in TERMINAL_STAGE_NAMES:
                yield terminal_event_frame(job_id, status)
                return
        if now - last_sent >= HEARTBEAT_INTERVAL_SECONDS:
            yield HEARTBEAT_FRAME
            last_sent = now
