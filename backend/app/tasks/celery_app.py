import asyncio
import logging
import sys

from celery import Celery
from celery.schedules import crontab
from celery.signals import worker_init

from app.core.config import get_settings

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

settings = get_settings()

celery_app = Celery(
    "cv_analyzer",
    broker=settings.CV_ANALYZER_REDIS_URL,
    backend=settings.CV_ANALYZER_REDIS_URL,
    include=[
        "app.tasks.document_processing",
        "app.tasks.nlp_analysis",
        "app.tasks.scoring",
        "app.tasks.grammar_check",
        "app.tasks.llm_suggest",
        "app.tasks.comparison",
        "app.tasks.cleanup",
    ],
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=600,
    task_soft_time_limit=540,
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=50,
    broker_connection_retry_on_startup=True,
    worker_hijack_root_logger=False,
)

celery_app.conf.beat_schedule = {
    "cleanup-expired-files": {
        "task": "app.tasks.cleanup.cleanup_expired_files",
        "schedule": crontab(minute="0", hour="*/1"),
    },
}


@worker_init.connect
def _on_worker_init(**_kwargs):
    from app.core.logging import InterceptHandler, setup_logging

    setup_logging()

    for name in logging.root.manager.loggerDict:
        logging.getLogger(name).handlers = []
        logging.getLogger(name).propagate = True

    logging.root.handlers = [InterceptHandler()]

    for name in (
        "celery",
        "celery.worker",
        "celery.worker.strategy",
        "celery.worker.request",
    ):
        log = logging.getLogger(name)
        log.handlers = [InterceptHandler()]
        log.propagate = False
        log.level = logging.INFO

    for name in ("httpx", "httpcore", "huggingface_hub", "urllib3"):
        logging.getLogger(name).setLevel(logging.WARNING)
