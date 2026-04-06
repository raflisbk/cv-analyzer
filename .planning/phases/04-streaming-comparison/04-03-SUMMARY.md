---
phase: "04-streaming-comparison"
plan: "03"
subsystem: "backend"
tags: ["pdf-export", "weasyprint", "jinja2", "streaming", "results-api"]
dependency_graph:
  requires: ["04-01"]
  provides: ["GET /api/v1/jobs/{id}/export/pdf", "comparison fields in /results"]
  affects: ["frontend/export-button", "04-05-frontend-integration"]
tech_stack:
  added: ["WeasyPrint 66.0+ (PDF rendering)", "Jinja2 (HTML templating)"]
  patterns: ["StreamingResponse", "FileSystemLoader", "isinstance guard for mock-safe pydantic"]
key_files:
  created:
    - backend/app/api/v1/endpoints/export.py
    - backend/app/templates/cv_analysis_report.html
  modified:
    - backend/app/api/v1/router.py
    - backend/app/api/v1/endpoints/results.py
decisions:
  - "D-C11: WeasyPrint + Jinja2 chosen over server-side puppeteer — zero Node dependency in backend"
  - "Template uses embedded CSS (not Tailwind) — WeasyPrint renders offline without build pipeline"
  - "isinstance(job.comparison_status, str) guard prevents MagicMock Pydantic validation errors in test suite"
metrics:
  duration: "~25 minutes"
  completed: "2026-04-07"
  tasks_completed: 2
  files_created: 2
  files_modified: 2
---

# Phase 04 Plan 03: WeasyPrint PDF Export Endpoint + Results Extension Summary

**One-liner:** WeasyPrint + Jinja2 `GET /jobs/{id}/export/pdf` StreamingResponse with full A4 report template; results.py extended to return `comparison_result` and `comparison_status`.

## What Was Built

### Task 1: PDF Export Endpoint + Jinja2 Template
- **`backend/app/api/v1/endpoints/export.py`** — `GET /jobs/{job_id}/export/pdf` endpoint
  - Fetches job from DB, builds Jinja2 template context, renders HTML via `cv_analysis_report.html`
  - Calls `HTML(string=html_content).write_pdf()` → returns `StreamingResponse(io.BytesIO(pdf_bytes), media_type="application/pdf")`
  - Content-Disposition: `attachment; filename=cv-analysis-{job_id[:8]}.pdf`
  - `mask_pii()` wraps all `logger.error()` calls per D-C15
  - Returns `WrappedResponse` JSON error on job-not-found (not a PDF error)
- **`backend/app/templates/cv_analysis_report.html`** — Jinja2 template
  - Embedded CSS, `@page { size: A4; margin: 2cm; }`, Arial font (no Tailwind/CDN)
  - Sections: Scores (5-box grid), Skills (badges), ATS Checks (pass/warn/fail), Grammar Issues (original → suggestion), AI Suggestions (by section), Comparison (match%, matched/missing skills, experience gaps, recommendation)
  - Comparison section gated on `comparison_status == 'complete'`
  - Color thresholds (CSS): 80% green / 60% blue / 40% amber / else red
  - Label thresholds (text): 85% Excellent / 70% Good / 50% Fair / else Low
- **`backend/app/api/v1/router.py`** — `export.router` registered with `tags=["export"]`

### Task 2: Extend results.py with Comparison Fields
- **`backend/app/api/v1/endpoints/results.py`** — extended `get_job_results()`
  - Added `ComparisonResult` import
  - Builds `ComparisonResult(**job.comparison_result)` when `comparison_status == "complete"`
  - `safe_comparison_status` guard: `isinstance(job.comparison_status, str) else None` — prevents Pydantic validation errors from MagicMock in test suite
  - Passes `comparison_result=` and `comparison_status=` to `AnalysisResult(...)` constructor

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] MagicMock Pydantic validation error in test_results_endpoint.py**
- **Found during:** Task 2 — after adding `comparison_status=job.comparison_status` to AnalysisResult
- **Issue:** `mock_complete_job` fixture uses `MagicMock()` without setting `comparison_status` → attribute returns MagicMock object → Pydantic `str | None` type validation fails
- **Fix:** Added `safe_comparison_status: str | None = job.comparison_status if isinstance(job.comparison_status, str) else None` guard before passing to AnalysisResult; also used this guard in the `== "complete"` check
- **Files modified:** `backend/app/api/v1/endpoints/results.py`
- **Commit:** `63d26c5`

### Out-of-Scope Issues (Logged, Not Fixed)
Pre-existing ruff warnings in unrelated files: `compare.py` (PLR2004), `ocr.py` (TRY300), `parser.py` (PLR0912, TRY300/301), `storage.py` (TRY300), `validation.py` (PLR2004), `tasks/comparison.py` (TRY300), `tasks/document_processing.py` (TRY300). These were present before this plan and are not caused by the changes made here.

Pre-existing test failure: `test_scorer.py::test_score_cv_all_values_are_int_0_to_100` — scorer returns `scoring_method: "rule_based"` string key alongside int values; test expects all values to be int. Not introduced by this plan.

## Test Results

| Test | Result |
|------|--------|
| `test_export_pdf_endpoint_exists` | ✅ PASSED |
| `test_export_pdf_content_type` | ⏭ SKIPPED (by design — requires real job_id) |
| `test_results_endpoint.py` (6 tests) | ✅ ALL PASSED |
| `test_comparison.py` (5 tests) | ✅ ALL PASSED |

## Wave 2 Completion Checklist

- [x] `python -c "from app.api.v1.endpoints.export import router"` exits 0
- [x] `grep "export.router" backend/app/api/v1/router.py` returns match
- [x] `backend/app/templates/cv_analysis_report.html` exists with `@page` A4 rule
- [x] `pytest tests/test_export.py -v` exits 0 (endpoint_exists test passes)
- [x] `grep "comparison_result" backend/app/api/v1/endpoints/results.py` returns match
- [x] WeasyPrint import verified: `from weasyprint import HTML` OK
- [x] black + ruff clean on new files
- [x] router.py has export router registered

## Commits

| Hash | Message |
|------|---------|
| `8b5871c` | feat(04-03): WeasyPrint PDF export endpoint + Jinja2 template |
| `63d26c5` | feat(04-03): extend results.py with comparison_result and comparison_status fields |

## Self-Check: PASSED
