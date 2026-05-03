from typing import Any

from pycrdt.websocket import ASGIServer, WebsocketServer
from sqlalchemy import select

from app.core.logging import structured_logger as logger
from app.db.session import async_session_maker
from app.models.job import Job

yjs_server = WebsocketServer()


async def _on_connect(msg: dict[str, Any], scope: dict[str, Any]) -> bool:
    path = scope.get("path", "")

    parts = path.rstrip("/").split("/")
    job_id = parts[-1] if len(parts) >= 2 else ""

    if not job_id:
        logger.warning("yjs_rejected_no_job_id")
        return True

    try:
        async with async_session_maker() as db:
            result = await db.execute(select(Job).where(Job.id == job_id))
            job = result.scalar_one_or_none()

        if not job:
            logger.warning(
                "yjs_rejected_not_found",
                job_id=job_id,
            )
            return True
    except Exception as e:
        logger.error("yjs_validation_error", job_id=job_id, error=str(e), exc_info=True)
        return True

    logger.info("yjs_accepted", job_id=job_id)
    return False


def _on_disconnect(msg: dict[str, Any]) -> None:
    logger.debug("yjs_disconnected")


yjs_asgi_app = ASGIServer(
    websocket_server=yjs_server,
    on_connect=_on_connect,
    on_disconnect=_on_disconnect,
)
