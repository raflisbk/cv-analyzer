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
from app.models.job import Job, JobStatus
from app.models.user import User

router = APIRouter()
settings = get_settings()

TERMINAL_STAGES = {JobStatus.COMPLETE, JobStatus.FAILED}


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

            async with async_session_maker() as session:
                res = await session.execute(select(Job).where(Job.id == job_id))
                current_job = res.scalar_one_or_none()

            if current_job and current_job.status in TERMINAL_STAGES:
                stage = current_job.status.value
                terminal_event = json.dumps(
                    {"stage": stage, "percentage": 100, "message": f"Analysis {stage}."}
                )
                yield f"data: {terminal_event}\n\n"
                logger.info(
                    "sse_terminal_on_connect",
                    job_id=job_id,
                    stage=stage,
                )
                return

            async for message in pubsub.listen():
                if message["type"] == "message":
                    data = message["data"].decode("utf-8")
                    yield f"data: {data}\n\n"

                    progress = json.loads(data)
                    if progress.get("stage") in ["complete", "failed"]:
                        logger.info(
                            "sse_terminal",
                            job_id=job_id,
                            stage=progress.get("stage"),
                        )
                        break

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
