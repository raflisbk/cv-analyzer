"""SSE streaming endpoint."""

import asyncio
import json

import redis.asyncio as redis
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from sqlalchemy import select

from app.core.config import get_settings
from app.core.logging import structured_logger as logger
from app.db.session import async_session_maker
from app.models.job import Job, JobStatus


router = APIRouter()
settings = get_settings()

TERMINAL_STAGES = {JobStatus.COMPLETE, JobStatus.FAILED}


@router.get("/stream/{job_id}")
async def stream_job_progress(job_id: str):
    """
    Stream real-time job progress via Server-Sent Events

    Client connection flow:
    1. Connect to this endpoint
    2. Receive "connected" event
    3. If job already terminal: receive terminal event immediately, then stream closes
    4. Otherwise receive progress updates as job processes
    5. Connection closes when job completes or fails

    Note: DB session is created and closed inside the generator — NOT via Depends(get_db).
    Using Depends with StreamingResponse causes the session to outlive the request and
    leaks connections on every reconnect, exhausting the pool.
    """

    async def event_generator():
        redis_client = await redis.from_url(settings.CV_ANALYZER_REDIS_URL)
        pubsub = redis_client.pubsub()

        try:
            await pubsub.subscribe(f"job:updates:{job_id}")

            yield f"data: {json.dumps({'type': 'connected', 'job_id': job_id})}\n\n"
            logger.info("SSE client connected", extra={"job_id": job_id})

            # Use a scoped session here — open, query, close immediately.
            # This prevents connection leaks: the session is returned to the pool
            # before entering the long-lived pubsub listen loop.
            async with async_session_maker() as db:
                result = await db.execute(select(Job).where(Job.id == job_id))
                job = result.scalar_one_or_none()

            if job and job.status in TERMINAL_STAGES:
                stage = job.status.value
                terminal_event = json.dumps(
                    {"stage": stage, "percentage": 100, "message": f"Analysis {stage}."}
                )
                yield f"data: {terminal_event}\n\n"
                logger.info(
                    "Job already terminal on SSE connect, emitting event and closing",
                    extra={"job_id": job_id, "stage": stage},
                )
                return

            # Listen for progress updates from Redis pubsub
            async for message in pubsub.listen():
                if message["type"] == "message":
                    data = message["data"].decode("utf-8")
                    yield f"data: {data}\n\n"

                    progress = json.loads(data)
                    if progress.get("stage") in ["complete", "failed"]:
                        logger.info(
                            "Job terminal state reached, closing SSE",
                            extra={"job_id": job_id, "stage": progress.get("stage")},
                        )
                        break

        except asyncio.CancelledError:
            logger.info("SSE client disconnected", extra={"job_id": job_id})
        finally:
            await pubsub.unsubscribe(f"job:updates:{job_id}")
            await redis_client.close()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable Nginx buffering
        },
    )
