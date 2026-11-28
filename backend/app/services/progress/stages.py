from dataclasses import dataclass

STEP_COUNT = 5
COMPLETE_STEP = STEP_COUNT


@dataclass(frozen=True)
class Stage:
    name: str
    step: int
    percentage: int


PIPELINE_STAGES: tuple[Stage, ...] = (
    Stage("extracting", 0, 5),
    Stage("validating", 0, 12),
    Stage("parsing", 0, 18),
    Stage("analyzing_sections", 1, 25),
    Stage("extracting_skills", 1, 40),
    Stage("detecting_archetype", 1, 52),
    Stage("scoring", 2, 62),
    Stage("grammar_check", 3, 76),
    Stage("indexing_cv", 4, 80),
    Stage("generating_suggestions", 4, 90),
    Stage("preparing_results", 4, 96),
    Stage("complete", COMPLETE_STEP, 100),
)

STAGES_BY_NAME = {stage.name: stage for stage in PIPELINE_STAGES}

INDEXING_PERCENTAGE_SPAN = (
    STAGES_BY_NAME["generating_suggestions"].percentage
    - STAGES_BY_NAME["indexing_cv"].percentage
    - 1
)


def stage_percentage(stage: str, fallback: int = 0) -> int:
    known = STAGES_BY_NAME.get(stage)
    return known.percentage if known else fallback


def indexing_percentage(done: int, total: int) -> int:
    base = STAGES_BY_NAME["indexing_cv"].percentage
    if total <= 0:
        return base
    return base + INDEXING_PERCENTAGE_SPAN * min(done, total) // total


def indexing_message(done: int, total: int) -> str:
    return f"Indexing your CV ({done}/{total})"


def build_progress_payload(
    job_id: str,
    stage: str,
    message: str,
    percentage: int | None = None,
    done: int | None = None,
    total: int | None = None,
) -> dict:
    payload = {
        "stage": stage,
        "percentage": stage_percentage(stage) if percentage is None else percentage,
        "message": message,
        "job_id": job_id,
    }
    known = STAGES_BY_NAME.get(stage)
    if known:
        payload["step"] = known.step
        payload["steps"] = STEP_COUNT
    if done is not None and total is not None:
        payload["done"] = done
        payload["total"] = total
    return payload
