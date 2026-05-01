from app.core.logging import structured_logger as logger
from app.services.storage import storage_service
from app.tasks.celery_app import celery_app


@celery_app.task(name="app.tasks.cleanup.cleanup_expired_files")
def cleanup_expired_files():
    logger.info("cleanup_starting")

    try:
        expired_files = storage_service.list_expired_files()

        if not expired_files:
            logger.info("cleanup_none")
            return {"deleted": 0}

        deleted_count = 0
        for file_id in expired_files:
            if storage_service.delete_file(file_id):
                deleted_count += 1

        logger.info(
            "cleanup_done",
            total_expired=len(expired_files),
            deleted=deleted_count,
        )

        return {"deleted": deleted_count, "total": len(expired_files)}

    except Exception as e:
        logger.error("cleanup_failed", error=str(e), exc_info=True)
        return {"error": str(e)}
