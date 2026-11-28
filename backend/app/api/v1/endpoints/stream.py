import asyncio
import json

import redis.asyncio as redis
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import select

from app.api.dependencies import check_job_access, get_current_user
from app.core.config import get_settings
from app.core.logging import structured_logger as logger
from app.db.session import AsyncSession, async_session_maker, get_db
from app.models.job import Job
from app.models.user import User
from app.services.progress.event_stream import (
    TERMINAL_STAGE_NAMES,
    iter_job_events,
    terminal_event_frame,
)

router = APIRouter()
settings = get_settings()


async def fetch_status_for(job_id: str) -> str | None:
    async with async_session_maker() as session:
        res = await session.execute(select(Job.status).where(Job.id == job_id))
        status = res.scalar_one_or_none()
    return status.value if status else None


@router.get("/stream/{job_id}")
async def stream_job_progress(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_current_user),
):
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail=f"Job {job_id} not found.")
    check_job_access(job, current_user)

    async def event_generator():
        redis_client = await redis.from_url(settings.CV_ANALYZER_REDIS_URL)
        pubsub = redis_client.pubsub()

        try:
            await pubsub.subscribe(f"job:updates:{job_id}")

            yield f"data: {json.dumps({'type': 'connected', 'job_id': job_id})}\n\n"
            logger.info("sse_connected", job_id=job_id)

            stage = await fetch_status_for(job_id)
            if stage in TERMINAL_STAGE_NAMES:
                yield terminal_event_frame(job_id, stage)
                logger.info(
                    "sse_terminal_on_connect",
                    job_id=job_id,
                    stage=stage,
                )
                return

            async for frame in iter_job_events(
                pubsub, job_id, lambda: fetch_status_for(job_id)
            ):
                yield frame
            logger.info("sse_closed", job_id=job_id)

        except asyncio.CancelledError:
            logger.info("sse_disconnected", job_id=job_id)
        finally:
            await pubsub.unsubscribe(f"job:updates:{job_id}")
            await redis_client.close()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
