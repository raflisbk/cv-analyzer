---
phase: "04"
plan: "00"
subsystem: "backend-testing + frontend-components + infrastructure"
tags: ["test-stubs", "weasyprint", "shadcn", "tdd", "wave-0"]
dependency_graph:
  requires: []
  provides: ["test-stub-contracts", "weasyprint-dep", "textarea-component"]
  affects: ["04-01", "04-02", "04-03", "04-04", "04-05", "04-06"]
tech_stack:
  added: ["weasyprint>=60.0 (conda-forge 66.0+pango)", "shadcn textarea component"]
  patterns: ["TDD red-phase stubs", "pytest.mark.xfail", "ImportError as test gate"]
key_files:
  created:
    - backend/tests/test_pii.py
    - backend/tests/test_comparison.py
    - backend/tests/test_stages.py
    - backend/tests/test_export.py
    - backend/tests/test_compare_endpoint.py
    - frontend/components/ui/textarea.tsx
  modified:
    - backend/pyproject.toml
decisions:
  - "Used weasyprint>=60.0 (conda-forge 66.0) instead of >=68.0 since conda-forge provides 66.0 with pango bundled"
  - "5 test stubs created as ImportError gates — fail red before features exist, go green after"
metrics:
  duration: "~15 minutes (including conda-forge install wait)"
  completed: "2026-04-07"
  tasks_completed: 2
  files_created: 7
---

# Phase 04 Plan 00: Wave-0 Test Stubs & WeasyPrint Summary

**One-liner:** TDD Wave-0 stubs for all Phase 4 requirements + WeasyPrint + shadcn textarea, establishing red-phase contracts for 5 test files.

## What Was Built

Wave 0 established the Nyquist sampling contracts for Phase 4:

1. **WeasyPrint installed** via conda-forge (66.0 with pango bundled for Windows) + `weasyprint>=60.0` in pyproject.toml
2. **shadcn textarea** installed at `frontend/components/ui/textarea.tsx`
3. **5 test stub files** created, all in red phase (failing until features exist):

| File | Tests | Requirement | Red Cause |
|------|-------|-------------|-----------|
| `test_pii.py` | 4 | ERROR-04 | `mask_pii` not in logging.py |
| `test_comparison.py` | 5 | COMPARE-03/05 | `ComparisonResult` not in analysis.py |
| `test_stages.py` | 2 | STREAM-01/02 | `app.tasks.comparison` module missing |
| `test_export.py` | 2 | EXPORT-01/03 | export endpoint not registered |
| `test_compare_endpoint.py` | 2 | COMPARE-01 | compare router not registered |

## Commits

| Hash | Message |
|------|---------|
| c201206 | chore(04-00): install weasyprint + shadcn textarea |
| 1e9dfb7 | test(04-00): add 5 Wave-0 test stubs (red phase) |

## Deviations from Plan

**1. [Rule 1 - Bug] WeasyPrint version pinned to >=60.0 instead of >=68.0**
- **Found during:** Task 1
- **Issue:** conda-forge provides weasyprint 66.0 on Windows (66.0 bundles pango/GTK, works correctly). pip can install 68.1 but it doesn't bundle pango — import fails on Windows without GTK system libs.
- **Fix:** Pinned `weasyprint>=60.0` in pyproject.toml; conda-forge 66.0 verified importable
- **Files modified:** backend/pyproject.toml

## Self-Check: PASSED

- [x] `frontend/components/ui/textarea.tsx` exists
- [x] `backend/tests/test_pii.py` exists
- [x] `backend/tests/test_comparison.py` exists
- [x] `backend/tests/test_stages.py` exists
- [x] `backend/tests/test_export.py` exists
- [x] `backend/tests/test_compare_endpoint.py` exists
- [x] `backend/pyproject.toml` contains weasyprint>=60.0
- [x] Commits c201206 and 1e9dfb7 exist
