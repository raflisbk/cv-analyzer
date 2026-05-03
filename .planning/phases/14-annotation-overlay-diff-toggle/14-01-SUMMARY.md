---
phase: 14
plan: "01"
subsystem: backend
tags: [anchors, pymupdf, celery, workspace, annotation, pdf]
dependency_graph:
  requires: [Phase 13 PDF workspace, Job.suggestion_anchors column (already in model)]
  provides: [suggestion_anchors JSONB populated on analysis complete, WorkspaceHydration.suggestion_anchors field]
  affects: [llm_suggest_task pipeline, workspace hydration API]
tech_stack:
  added: [PyMuPDF (fitz) for PDF text search, SuggestionAnchorRecord pydantic schema]
  patterns: [graceful degradation on anchor failure, lazy top-level storage import resolved to module-level]
key_files:
  created:
    - backend/app/schemas/anchors.py
    - backend/app/services/anchor_service.py
  modified:
    - backend/app/tasks/llm_suggest.py
    - backend/app/schemas/workspace.py
    - backend/app/api/v1/endpoints/workspace.py
decisions:
  - Move storage import to module-level in anchor_service (ruff PLC0415 disallows function-level imports)
  - Keep anchor computation synchronous (blocking) inside _save_results — fitz is CPU-bound, no async needed
  - StorageError unused after except clause generalized to Exception — removed per ruff F401
metrics:
  duration: ~15min
  completed: "2026-04-12"
  tasks_completed: 2
  files_modified: 5
---

# Phase 14 Plan 01: Backend Anchor Computation & Schema Extension Summary

**One-liner:** Pre-compute PDF text bounding rects server-side via PyMuPDF during the Celery analysis pipeline, storing results as JSONB and exposing them through the workspace hydration API.

## What Was Done

### Task 1 — AnchorRect + SuggestionAnchorRecord schemas + anchor_service

Created two new files:

**`backend/app/schemas/anchors.py`**
- `AnchorRect`: Pydantic model with `x`, `y`, `w`, `h` floats representing a bounding rect in PDF points (top-left origin, y-down — CSS-compatible, no coordinate flip needed)
- `SuggestionAnchorRecord`: Maps a suggestion item to a page rect with deterministic `suggestion_id` (`"{section}_{item_idx}_{card_idx}"`), `text_anchor`, `page_index`, `rect`, and `priority`

**`backend/app/services/anchor_service.py`**
- `compute_suggestion_anchors(file_id, suggestions)` → downloads PDF bytes from R2 via `storage_service.get_file()`, opens with `fitz.open()`, iterates all suggestion cards/items, calls `page.search_for()` with `original_text[:100]` (falls back to `[:60]` on no match), records first matching page rect as a dict for JSONB storage
- Graceful degradation: returns `[]` on any R2/fitz failure — anchor absence is non-fatal
- Used first-party import at module level (required by ruff PLC0415)

### Task 2 — llm_suggest_task + WorkspaceHydration + workspace endpoint

**`backend/app/tasks/llm_suggest.py`**
- Added `from app.services.anchor_service import compute_suggestion_anchors` import
- Added `_get_file_id()` inner async helper to fetch `job.file_id` from DB
- Added `job_file_id = asyncio.run(_get_file_id())` call after Redis cache check (before heavy LLM work)
- Extended `_save_results(suggestions_json, tokens_used, file_id="")` with optional `file_id` parameter
- Inside `_save_results`: when `suggestions_json and file_id`, computes and stores `job.suggestion_anchors = compute_suggestion_anchors(file_id, suggestions_json)`
- Updated both success paths (cache hit + fresh LLM result) to pass `file_id=job_file_id`
- Error path (`_save_results(None, tokens_used=0)`) left without `file_id` — no anchors needed for failed LLM

**`backend/app/schemas/workspace.py`**
- Added `from app.schemas.anchors import SuggestionAnchorRecord`
- Added `suggestion_anchors: list[SuggestionAnchorRecord] = Field(default_factory=list)` to `WorkspaceHydration`

**`backend/app/api/v1/endpoints/workspace.py`**
- Added `from app.schemas.anchors import SuggestionAnchorRecord` import
- Added `_build_suggestion_anchors(raw_anchors)` helper: validates JSONB list into `SuggestionAnchorRecord` objects with per-item `try/except` for graceful degradation
- In `get_workspace_hydration`: added `safe_suggestion_anchors` extraction from `job.suggestion_anchors`, wired `suggestion_anchors=_build_suggestion_anchors(safe_suggestion_anchors)` into `WorkspaceHydration(...)` constructor

## Acceptance Criteria Results

| # | Check | Result |
|---|-------|--------|
| 1 | `from app.schemas.anchors import ...; from app.services.anchor_service import ...; print('OK')` | ✅ OK |
| 2 | `suggestion_anchors` in `backend/app/schemas/workspace.py` | ✅ matches |
| 3 | `compute_suggestion_anchors` import + call in `llm_suggest.py` | ✅ matches (line 21 + line 121) |
| 4 | `_build_suggestion_anchors` in `workspace.py` endpoint | ✅ matches |
| 5 | `from app.main import app; print('OK')` | ✅ OK |
| 6 | Black + ruff pass on all 5 files | ✅ pass |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Ruff PLC0415: function-level import in anchor_service**
- **Found during:** Task 1 Step 4 (ruff check)
- **Issue:** Plan template placed `from app.services.storage import StorageError, storage_service` inside the function body; ruff disallows non-top-level imports
- **Fix:** Moved import to module level
- **Files modified:** `backend/app/services/anchor_service.py`
- **Commit:** 9ad99e9

**2. [Rule 1 - Bug] Ruff F401: StorageError imported but unused**
- **Found during:** Task 1 Step 4 (ruff check)
- **Issue:** After changing `except (StorageError, Exception)` to `except Exception`, `StorageError` became unused
- **Fix:** Auto-removed via `ruff check --fix`
- **Files modified:** `backend/app/services/anchor_service.py`
- **Commit:** 9ad99e9

**3. [Rule 1 - Bug] Pre-existing RUF010 violations in workspace endpoint**
- **Found during:** Task 2 Step 5 (ruff check on reformatted file)
- **Issue:** `f"...{str(exc)}"` → should use `f"...{exc!s}"` (pre-existing, surfaced by formatting)
- **Fix:** Auto-fixed via `ruff check --fix`
- **Files modified:** `backend/app/api/v1/endpoints/workspace.py`
- **Commit:** 6b7ce85

## Known Stubs

None — `suggestion_anchors` is fully wired: computed during Celery task, stored to DB, parsed on workspace load, returned in hydration payload.

## Commits

| Hash | Message |
|------|---------|
| `9ad99e9` | feat(14-01): add AnchorRect/SuggestionAnchorRecord schemas + PyMuPDF anchor_service |
| `6b7ce85` | feat(14-01): wire anchor computation into llm_suggest_task + workspace hydration |

## Self-Check: PASSED

- `backend/app/schemas/anchors.py` — FOUND ✅
- `backend/app/services/anchor_service.py` — FOUND ✅
- `backend/app/tasks/llm_suggest.py` — FOUND (modified) ✅
- `backend/app/schemas/workspace.py` — FOUND (modified) ✅
- `backend/app/api/v1/endpoints/workspace.py` — FOUND (modified) ✅
- Commit `9ad99e9` — FOUND ✅
- Commit `6b7ce85` — FOUND ✅
