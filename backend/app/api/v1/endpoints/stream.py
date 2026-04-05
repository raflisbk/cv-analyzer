"""
SSE streaming endpoint
Implements D-13: SSE streams detailed stages
Implements D-25: Separate /stream/{job_id} endpoint for SSE
"""

import asyncio
import json

import redis.asyncio as redis
from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from app.core.config import get_settings
from app.core.logging import structured_logger as logger


router = APIRouter()
settings = get_settings()


@router.get("/stream/{job_id}")
async def stream_job_progress(job_id: str):
    """
    Stream real-time job progress via Server-Sent Events

    Client connection flow:
    1. Connect to this endpoint
    2. Receive "connected" event
    3. Receive progress updates as job processes
    4. Connection closes when job completes or fails
    """

    async def event_generator():
        redis_client = await redis.from_url(settings.CV_ANALYZER_REDIS_URL)
        pubsub = redis_client.pubsub()

        try:
            # Subscribe to job updates channel per D-14
            await pubsub.subscribe(f"job:updates:{job_id}")

            # Send initial connection event
            yield f"data: {json.dumps({'type': 'connected', 'job_id': job_id})}\n\n"

            logger.info("SSE client connected", extra={"job_id": job_id})

            # Listen for progress updates
            async for message in pubsub.listen():
                if message["type"] == "message":
                    data = message["data"].decode("utf-8")
                    yield f"data: {data}\n\n"

                    # Stop streaming if job terminal state
                    progress = json.loads(data)
                    if progress.get("stage") in ["complete", "failed"]:
                        logger.info(
                            "Job terminal state reached, closing SSE",
                            extra={"job_id": job_id, "stage": progress.get("stage")},
                        )
                        break

        except asyncio.CancelledError:
            # Client disconnected
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
