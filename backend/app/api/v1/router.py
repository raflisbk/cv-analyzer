from fastapi import APIRouter

from app.api.v1.endpoints import (
    chat,
    compare,
    export,
    inline_edit,
    jobs,
    results,
    stream,
    upload,
    workspace,
)

router = APIRouter(prefix="/v1")

router.include_router(upload.router, tags=["upload"])
router.include_router(jobs.router, tags=["jobs"])
router.include_router(stream.router, tags=["stream"])
router.include_router(results.router, tags=["results"])
router.include_router(workspace.router, tags=["workspace"])
router.include_router(inline_edit.router, tags=["inline-edit"])
router.include_router(export.router, tags=["export"])
router.include_router(compare.router, tags=["comparison"])
router.include_router(chat.router, tags=["chat"])
