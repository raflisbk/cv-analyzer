---
phase: "04"
plan: "01"
subsystem: "backend-db + backend-models + backend-schemas + backend-logging"
tags: ["alembic", "migration", "job-roles", "schemas", "pii-masking", "wave-1"]
dependency_graph:
  requires: ["04-00"]
  provides: ["job_roles-table", "JobRole-model", "JobStatus.COMPARING", "ComparisonResult-schema", "mask_pii-utility"]
  affects: ["04-02", "04-03", "04-04", "04-05", "04-06"]
tech_stack:
  added: []
  patterns: ["Alembic data migration with gen_random_uuid()", "PostgreSQL ALTER TYPE ADD VALUE IF NOT EXISTS", "Pydantic schema extension", "regex PII masking compiled at module level"]
key_files:
  created:
    - backend/alembic/versions/20260407_0002_2f7cea2fde5e_add_comparison_layer.py
    - backend/app/models/job_role.py
  modified:
    - backend/app/models/job.py
    - backend/app/schemas/analysis.py
    - backend/app/core/logging.py
decisions:
  - "COMPARING enum value added BEFORE 'COMPLETE' to maintain logical sort order"
  - "20 seed rows via Alembic data migration (not seed script) per D-C4 decision"
  - "mask_pii() compiled regexes at module level for performance per D-C15"
  - "JobRole Pydantic schema is separate from JobRole SQLAlchemy model (same name, different module)"
metrics:
  duration: "~20 minutes"
  completed: "2026-04-07"
  tasks_completed: 2
  files_created: 2
  files_modified: 3
---

# Phase 04 Plan 01: DB Foundation & Schema Contracts Summary

**One-liner:** Alembic migration creating job_roles table with 20 seeded roles + COMPARING enum + 4 comparison columns on jobs, plus ComparisonResult/JobRole/SkillGapGroup schemas and mask_pii() utility.

## What Was Built

### Task 1: DB Migration + Models

**Alembic migration `2f7cea2fde5e` (add_comparison_layer):**
- `job_roles` lookup table: id (UUID PK), title, seniority (CHECK: junior/mid/senior), industry, description, requirements, created_at
- `ALTER TYPE jobstatus ADD VALUE IF NOT EXISTS 'COMPARING' BEFORE 'COMPLETE'`
- 4 new columns on `jobs`: `comparison_result` (JSONB), `comparison_status` (VARCHAR 20), `jd_text` (TEXT), `jd_role_id` (UUID FK → job_roles.id)
- 20 seed rows across Technology (Backend, Frontend, ML, AI, DevOps, Cloud), Business (PM, Data Analyst, Marketing), Design (UX) verticals

**JobRole SQLAlchemy model** (`backend/app/models/job_role.py`):
- Clean ORM model matching migration schema

**Job model extension** (`backend/app/models/job.py`):
- `JobStatus.COMPARING = "comparing"` added after GENERATING
- 4 comparison columns added with `ForeignKey("job_roles.id")`
- Added `ForeignKey` and `Text` to SQLAlchemy imports

### Task 2: Schemas + mask_pii()

**`backend/app/schemas/analysis.py` additions:**
- `ComparisonResult`: match_pct (int 0-100), matched_skills, missing_skills, matched_experience, missing_experience, overall_recommendation
- `SkillGapGroup`: present/missing/partial skill lists per COMPARE-05
- `JobRole`: id/title/seniority/industry for dropdown per COMPARE-02
- `AnalysisResult` extended: comparison_result (ComparisonResult|None) + comparison_status (str|None)

**`backend/app/core/logging.py` additions:**
- `mask_pii(text: str) -> str` — regex-based PII masking
- Strips email, phone numbers, and capitalized name patterns
- Compiled at module level (`_EMAIL_RE`, `_PHONE_RE`, `_NAME_RE`) for performance

## Test Results

| Test File | Tests | Result |
|-----------|-------|--------|
| test_pii.py | 4 | ✅ PASS (green phase) |
| test_comparison.py | 5 | ✅ PASS (green phase) |

## Commits

| Hash | Message |
|------|---------|
| dc3af81 | feat(04-01): DB migration + JobRole model + Job.COMPARING enum |
| d866605 | feat(04-01): ComparisonResult/JobRole/SkillGapGroup schemas + mask_pii utility |

## Deviations from Plan

**1. [Rule 1 - Bug] Fixed RET504 + RUF003 ruff issues in new code**
- **Found during:** Task 2 verification
- **Issue:** `mask_pii()` had unnecessary variable reassignment (RET504); analysis.py had EN DASH in comment (RUF003)
- **Fix:** Changed final `return _NAME_RE.sub(...)` directly; changed `–` to `-` in comment
- **Files modified:** backend/app/core/logging.py, backend/app/schemas/analysis.py

## Known Stubs

None — all schemas are fully wired with real fields. No placeholders.

## Self-Check: PASSED

- [x] Migration file `20260407_0002_2f7cea2fde5e_add_comparison_layer.py` exists
- [x] `backend/app/models/job_role.py` exists with `class JobRole(Base)`
- [x] `grep "COMPARING" backend/app/models/job.py` returns `COMPARING = "comparing"`
- [x] `grep "comparison_result" backend/app/models/job.py` returns JSONB column
- [x] `grep "class ComparisonResult" backend/app/schemas/analysis.py` returns match
- [x] `grep "def mask_pii" backend/app/core/logging.py` returns match
- [x] `python -c "from app.models.job_role import JobRole"` exits 0
- [x] `python -c "from app.models.job import JobStatus; assert JobStatus.COMPARING"` exits 0
- [x] `python -c "from app.schemas.analysis import ComparisonResult, JobRole, SkillGapGroup"` exits 0
- [x] `python -c "from app.core.logging import mask_pii; assert mask_pii('x@x.com') == '[EMAIL]'"` exits 0
- [x] `pytest tests/test_pii.py tests/test_comparison.py` — 9/9 PASS
- [x] Commits dc3af81 and d866605 exist
