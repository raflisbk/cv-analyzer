"""
Celery application configuration
Implements D-12: Redis/Celery for production reliability
"""

from celery import Celery
from celery.schedules import crontab

from app.core.config import get_settings


settings = get_settings()

# Create Celery app
celery_app = Celery(
    "cv_analyzer",
    broker=settings.CV_ANALYZER_REDIS_URL,
    backend=settings.CV_ANALYZER_REDIS_URL,
    include=["app.tasks.document_processing", "app.tasks.cleanup"],
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=600,  # 10 minutes max per task
    task_soft_time_limit=540,  # 9 minutes soft limit
    worker_prefetch_multiplier=1,  # One task at a time per worker
    worker_max_tasks_per_child=50,  # Restart worker after 50 tasks
)

# Scheduled tasks per D-20 (24-hour cleanup)
celery_app.conf.beat_schedule = {
    "cleanup-expired-files": {
        "task": "app.tasks.cleanup.cleanup_expired_files",
        "schedule": crontab(minute="0", hour="*/1"),  # Run every hour
    },
}
