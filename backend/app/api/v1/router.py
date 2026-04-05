"""API v1 router"""

from fastapi import APIRouter

from app.api.v1.endpoints import jobs, stream, upload


router = APIRouter(prefix="/v1")

router.include_router(upload.router, tags=["upload"])
router.include_router(jobs.router, tags=["jobs"])
router.include_router(stream.router, tags=["stream"])
