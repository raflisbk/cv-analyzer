---
phase: "04-streaming-comparison"
plan: "02"
subsystem: "backend"
tags: ["celery", "comparison", "api", "llm", "redis", "fastapi"]
dependency_graph:
  requires: ["04-01"]
  provides: ["compare_cv_task", "GET /job-roles", "POST /jobs/{id}/compare"]
  affects: ["backend/app/tasks/comparison.py", "backend/app/services/llm/openai_service.py", "backend/app/api/v1/endpoints/compare.py", "backend/app/api/v1/router.py"]
tech_stack:
  added: []
  patterns: ["Celery task with ProgressTask base", "Redis cache TTL 24h", "SSE progress stage", "FastAPI field_validator min-length", "tenacity 3x retry on LLM calls"]
key_files:
  created:
    - backend/app/tasks/comparison.py
    - backend/app/api/v1/endpoints/compare.py
  modified:
    - backend/app/services/llm/openai_service.py
    - backend/app/tasks/celery_app.py
    - backend/app/api/v1/router.py
decisions:
  - "compare_cv_task mirrors llm_suggest.py exactly: same ProgressTask base, Redis singleton lazy-init, asyncio.run() for all DB ops"
  - "compare_cv() on OpenAILLMService uses same @retry tenacity decorator as generate_suggestions() — no separate _call_with_retry helper needed"
  - "magic value 50 extracted to _JD_MIN_LENGTH constant to satisfy ruff PLR2004"
  - "router.py had extra 'export' router already registered — added compare after export"
metrics:
  duration: "~15 minutes"
  completed: "2026-04-07"
  tasks_completed: 2
  files_changed: 5
---

# Phase 04 Plan 02: Comparison Celery Task + API Endpoints Summary

**One-liner:** Async `compare_cv_task` Celery task with Redis caching, `comparing_job` SSE stage, `gpt-4o-mini` JSON-mode LLM comparison, and `GET /job-roles` + `POST /jobs/{id}/compare` FastAPI endpoints.

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | compare_cv_task Celery task + OpenAI compare_cv() + celery_app registration | `fe3b89c` | comparison.py, openai_service.py, celery_app.py |
| 2 | GET /job-roles + POST /jobs/{id}/compare endpoints + router registration | `003994d` | compare.py, router.py |

## What Was Built

### Task 1: compare_cv_task

- **`backend/app/tasks/comparison.py`** — mirrors `llm_suggest.py` exactly:
  - `bind=True`, `base=ProgressTask`, `max_retries=1`, `default_retry_delay=30`
  - Module-level `_llm_service = OpenAILLMService()` + lazy Redis singleton `_get_redis_client()`
  - Redis cache key: `comparison:{job_id}:{hashlib.sha256(jd_text.encode()).hexdigest()[:16]}`, TTL 86400s
  - Emits `"comparing_job"` SSE stage via `self.update_progress(job_id, "comparing_job", 50, "...")`
  - `asyncio.run()` for all 3 DB helpers: `_get_cv_text()`, `_set_comparing_status()`, `_save_comparison()`
  - Saves to: `comparison_result` (JSONB), `comparison_status`, `jd_text`, `jd_role_id`
  - Exception handler: `mask_pii()` wrapping error log message per D-C15; sets `comparison_status="failed"`; emits `complete` — NEVER sets job.status=FAILED

- **`backend/app/services/llm/openai_service.py`** — added `compare_cv()` method:
  - Same `@retry(stop_after_attempt(3), ...)` tenacity decorator as `generate_suggestions()`
  - Inputs truncated: `cv_text[:4000]`, `jd_text[:2000]`
  - `response_format={"type": "json_object"}` with inline system + user prompts
  - Returns `{"comparison": dict, "prompt_tokens": int, "completion_tokens": int}`
  - Increments Prometheus `llm_tokens_counter` per D-16

- **`backend/app/tasks/celery_app.py`** — added `"app.tasks.comparison"` to `include` list after `"app.tasks.llm_suggest"`

### Task 2: API Endpoints

- **`backend/app/api/v1/endpoints/compare.py`**:
  - `CompareRequest` Pydantic model with `@field_validator("jd_text")` enforcing `>= 50 chars` (returns 422 if short)
  - `GET /job-roles` — queries `job_roles` table ordered by `title, seniority`; returns `WrappedResponse[list[JobRole]]`
  - `POST /jobs/{job_id}/compare` — validates job exists, sets `comparison_status="pending"`, fires `compare_cv_task.delay()`
  - Both endpoints wrapped in `try/except` returning `WrappedResponse` with `ErrorDetail` on failure

- **`backend/app/api/v1/router.py`** — added `compare.router` registration under `tags=["comparison"]`

## Verification Results

```
$ pytest tests/test_stages.py tests/test_compare_endpoint.py -v
============================= 5 passed in 18.95s =============================

$ python -c "from app.tasks.comparison import compare_cv_task; print(compare_cv_task.name)"
app.tasks.comparison.compare_cv_task

$ python -c "from app.api.v1.endpoints.compare import router; from app.main import app; print('OK')"
app startup OK
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] router.py had `export` router not shown in plan's context snippet**
- **Found during:** Task 2
- **Issue:** Plan showed router.py with 4 routers; actual file had 5 (included `export.router` from a prior wave)
- **Fix:** Added `compare` to import and include after `export` (not instead of it)
- **Files modified:** `backend/app/api/v1/router.py`
- **Commit:** `003994d`

**2. [Rule 2 - Linting] Magic value `50` triggered ruff PLR2004**
- **Found during:** Task 2
- **Issue:** `if len(v.strip()) < 50` is a magic value comparison
- **Fix:** Extracted to `_JD_MIN_LENGTH = 50` module constant
- **Files modified:** `backend/app/api/v1/endpoints/compare.py`
- **Commit:** `003994d`

## Known Stubs

None — all new code is wired to real DB, real Celery, real OpenAI service.

## Self-Check: PASSED

- ✅ `backend/app/tasks/comparison.py` exists
- ✅ `backend/app/api/v1/endpoints/compare.py` exists
- ✅ Commits `fe3b89c` and `003994d` exist in git log
- ✅ 5/5 tests pass (`test_stages.py` + `test_compare_endpoint.py`)
- ✅ `compare_cv_task.name == "app.tasks.comparison.compare_cv_task"`
- ✅ FastAPI app starts without import errors
