import asyncio

from celery import Task
from sqlalchemy import select

from app.core.logging import structured_logger as logger
from app.db.session import async_session_maker
from app.models import Job, JobStatus
from app.services.nlp.entity_extractor import extract_entities
from app.services.nlp.section_detector import detect_sections
from app.services.nlp.skill_extractor import extract_skills
from app.tasks.celery_app import celery_app
from app.tasks.document_processing import ProgressTask, mark_job_failed


@celery_app.task(
    bind=True,
    base=ProgressTask,
    max_retries=3,
    default_retry_delay=30,
)
def nlp_analyze_task(self: Task, job_id: str) -> dict:
    async def _run() -> dict:
        # Load job data
        async with async_session_maker() as session:
            stmt = select(Job).where(Job.id == job_id)
            result = await session.execute(stmt)
            job = result.scalar_one_or_none()

            if not job or not job.result:
                msg = f"No parsed text found for job {job_id}"
                logger.error("nlp_no_text", job_id=job_id)
                if job:
                    job.status = JobStatus.FAILED
                    job.error = msg
                    await session.commit()
                self.update_progress(job_id, "failed", 0, msg)
                return {"error": msg}

            text = job.result.get("text", "")

        # NLP work (sync, potentially slow) — outside DB session
        self.update_progress(
            job_id, "analyzing_sections", 30, "Detecting CV sections..."
        )
        sections = detect_sections(text)
        self.update_progress(
            job_id, "extracting_skills", 60, "Extracting skills and entities..."
        )
        skills = extract_skills(text)
        entities = extract_entities(text, sections=sections)

        self.update_progress(
            job_id, "detecting_role", 80, "Detecting job role from CV..."
        )
        from app.services.llm.role_detector import detect_role_from_cv
        detected_role = detect_role_from_cv(text)

        self.update_progress(
            job_id, "detecting_archetype", 88, "Detecting AI role archetype..."
        )
        from app.services.llm.archetype_detector import detect_archetype
        archetype = detect_archetype(text, detected_role)

        nlp_result = {
            "sections": [
                {"type": s.type, "text": s.text, "entities": s.entities}
                for s in sections
            ],
            "skills": skills,
            "entities": entities,
            "detected_role": detected_role,
            "archetype": archetype,
        }

        # Save results
        async with async_session_maker() as session:
            stmt = select(Job).where(Job.id == job_id)
            result = await session.execute(stmt)
            job = result.scalar_one_or_none()
            if job:
                job.nlp_result = nlp_result
                await session.commit()

        logger.info(
            "nlp_done",
            job_id=job_id,
            section_count=len(sections),
            skill_count=len(skills),
            detected_role=detected_role,
        )
        return {"status": "nlp_complete", "job_id": job_id}

    try:
        return asyncio.run(_run())
    except Exception as e:
        error_msg = f"NLP analysis failed: {e!s}"
        logger.error("nlp_failed", job_id=job_id, error=error_msg, exc_info=True)
        asyncio.run(mark_job_failed(job_id, error_msg))
        self.update_progress(job_id, "failed", 0, error_msg)
        return {"error": error_msg}
