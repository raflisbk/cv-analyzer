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
  added: ["weasyprint>=60.0 (conda-forge 67.0+pango)", "shadcn textarea component"]
  patterns: ["TDD red-phase stubs", "pytest collection gates", "ImportError as test gate"]
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
    - .gitignore
decisions:
  - "Used weasyprint>=60.0 (conda-forge 67.0) instead of >=68.0 since v68.0 does not exist yet"
  - "test_pii.py and test_comparison.py PASS (green) — implementations were pre-built in 04-01"
  - "5 test stubs created — 3 intentionally fail (red), 2 pass (already implemented)"
metrics:
  duration: "~35 minutes (including conda-forge install wait)"
  completed: "2026-04-07"
  tasks_completed: 2
  files_created: 5
  commits: 2
---

# Phase 04 Plan 00: Wave-0 Test Stubs & WeasyPrint Summary

**One-liner:** WeasyPrint 67.0 installed via conda-forge + 5 TDD Wave-0 test stubs covering PII masking, comparison schema, SSE stages, PDF export, and compare endpoint.

## What Was Built

Wave 0 established the Nyquist sampling contracts for Phase 4:

1. **WeasyPrint 67.0 installed** via conda-forge + `weasyprint>=60.0` in pyproject.toml
2. **shadcn textarea** confirmed at `frontend/components/ui/textarea.tsx`
3. **5 test stub files** created (3 red-phase, 2 already green):

| File | Tests | Requirement | Status |
|------|-------|-------------|--------|
| `test_pii.py` | 4 | ERROR-04/D-C15 | ✅ GREEN (mask_pii pre-implemented in 04-01) |
| `test_comparison.py` | 5 | COMPARE-03/05 | ✅ GREEN (ComparisonResult pre-implemented in 04-01) |
| `test_stages.py` | 2 | STREAM-01/02 | 🔴 RED (`app.tasks.comparison` module missing) |
| `test_export.py` | 2 | EXPORT-01/03 | 🔴 RED (export endpoint not registered) |
| `test_compare_endpoint.py` | 3 | COMPARE-01/02 | 🔴 RED (compare/job-roles router not registered) |

## Commits

| Hash | Message |
|------|---------|
| 031d87d | chore(04-00): install weasyprint>=60.0 and shadcn textarea |
| 8ed5a3c | test(04-00): add Wave 0 test stubs for comparison, export, PII, stages |

## Deviations from Plan

**1. [Rule 1 - Bug] WeasyPrint version constraint corrected from >=68.0 to >=60.0**
- **Found during:** Task 1
- **Issue:** conda-forge provides weasyprint 67.0 on Windows (bundles pango/GTK, works correctly). Version 68.0 does not exist on conda-forge or PyPI.
- **Fix:** Pinned `weasyprint>=60.0` in pyproject.toml; conda-forge 67.0 verified importable in sbk-cv-analyzer env
- **Files modified:** backend/pyproject.toml
- **Commit:** 031d87d

**2. [Rule 1 - Context] test_pii.py and test_comparison.py already GREEN**
- **Found during:** Task 2
- **Issue:** Plan assumed mask_pii and ComparisonResult don't exist yet (Wave 0 = red phase). However, Plan 04-01 was executed before 04-00, pre-implementing both.
- **Impact:** test_pii.py (4 tests) and test_comparison.py (5 tests) PASS immediately — they serve as regression tests. Better outcome than red phase.
- **Action:** No fix needed.

**3. [Rule 2 - Cleanup] Untracked pip output file `0.3.0` added to .gitignore**
- **Found during:** Task 2 git status
- **Fix:** Added `[0-9]*.[0-9]*` pattern to .gitignore
- **Files modified:** .gitignore

**4. [Rule 2 - Completeness] Added missing test_job_roles_endpoint_exists**
- **Found during:** Task 2 — existing file was missing this function from the plan spec
- **Fix:** Added `test_job_roles_endpoint_exists` covering COMPARE-02 to test_compare_endpoint.py
- **Commit:** 8ed5a3c

## Self-Check: PASSED

- [x] `frontend/components/ui/textarea.tsx` exists
- [x] `backend/tests/test_pii.py` exists
- [x] `backend/tests/test_comparison.py` exists
- [x] `backend/tests/test_stages.py` exists
- [x] `backend/tests/test_export.py` exists
- [x] `backend/tests/test_compare_endpoint.py` exists
- [x] `backend/pyproject.toml` contains weasyprint>=60.0
- [x] Commits 031d87d and 8ed5a3c exist
