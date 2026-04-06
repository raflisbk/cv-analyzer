---
phase: "04-streaming-comparison"
plan: "06"
subsystem: "frontend/results"
tags: ["tabs", "compare", "export", "sticky-bar", "suggestion-toggle", "wave-4"]
dependency_graph:
  requires: ["04-02", "04-03", "04-04", "04-05"]
  provides: ["Tab 5 Compare wired", "ExportStickyBar", "SuggestionBeforeAfter toggle"]
  affects: ["frontend/app/results/[job_id]/page.tsx", "frontend/components/results/results-tabs.tsx"]
tech_stack:
  added: ["sonner toast", "navigator.clipboard API", "Blob URL download pattern"]
  patterns: ["slide-up animation via translate-y CSS transition", "useEffect delay 100ms", "useQuery staleTime Infinity"]
key_files:
  created:
    - "frontend/components/results/export-sticky-bar.tsx"
  modified:
    - "frontend/components/results/results-tabs.tsx"
    - "frontend/components/results/suggestion-card.tsx"
    - "frontend/app/results/[job_id]/page.tsx"
decisions:
  - "Used analysisStatus prop (string) in ExportStickyBar rather than boolean visible — more flexible and allows future status checks"
  - "ComparisonSkeleton passed as CompareTab children for completeness; CompareTab handles loading state internally (no rendering conflict)"
  - "job-roles query uses staleTime: Infinity since job roles are static reference data"
metrics:
  duration: "~15 minutes"
  tasks_completed: 2
  files_created: 1
  files_modified: 3
  completed_date: "2025-07-14"
---

# Phase 4 Plan 06: Final Assembly — Tab 5 + SuggestionCard Toggle + ExportStickyBar Summary

**One-liner:** Wired all Phase 4 components into results page: Tab 5 "Compare" with job description textarea + result display, expandable SuggestionBeforeAfter toggles on each suggestion card, and ExportStickyBar with clipboard copy + PDF download slide-up animation.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Tab 5 Compare + SuggestionBeforeAfter toggle | `134e375` | results-tabs.tsx, suggestion-card.tsx |
| 2 | ExportStickyBar + results page wiring | `1b515cd` | export-sticky-bar.tsx (new), page.tsx |

## What Was Built

### Task 1: Tab 5 "Compare" in ResultsTabs

**File:** `frontend/components/results/results-tabs.tsx`

- Added `ArrowLeftRight` icon + imports for CompareTab, ComparisonSkeleton, MatchScoreCard, SkillsGapDisplay, MissingQualificationsList
- Extended `ResultsTabsProps` with `jobRoles?: JobRole[]`
- Added 5th `TabsTrigger` (value="compare", min-h-[44px] touch target)
- Added `TabsContent value="compare"` rendering:
  - `<ComparisonSkeleton />` as children when `comparison_status` is pending/comparing
  - `<MatchScoreCard>` + `<SkillsGapDisplay>` + `<MissingQualificationsList>` when complete
  - `<CompareTab>` wraps all — handles idle/error states internally
- Existing `overflow-x-auto` on TabsList retained for mobile scrolling

**File:** `frontend/components/results/suggestion-card.tsx`

- Imported `SuggestionBeforeAfter` from `./suggestion-before-after`
- Wrapped each suggestion item in a `<div>` with `SuggestionBeforeAfter` below it
- `id` prop uses `${card.section}-${i}` for unique ARIA linking
- `beforeText` prop uses `item.text` (the suggestion text as original context per D-C19)
- Existing card structure (header, priority badge) unchanged

### Task 2: ExportStickyBar + Results Page Integration

**File:** `frontend/components/results/export-sticky-bar.tsx` (new)

- Fixed bottom bar: `fixed bottom-0 left-0 right-0 h-12 z-50 bg-background border-t border-border`
- Slide-up animation: `translate-y-full opacity-0` → `translate-y-0 opacity-100` with `transition-all duration-300 ease-out`
- 100ms `useEffect` delay after `analysisStatus === "complete"` triggers animation
- Returns `null` when `analysisStatus !== "complete"` (no DOM space)
- **Copy Suggestion**: `navigator.clipboard.writeText(topSuggestionText)` → sonner `toast("Suggestion copied to clipboard")` → icon switches to `Check` for 2000ms
- **Download PDF**: `fetch(/api/v1/jobs/${jobId}/export/pdf)` → `response.blob()` → `URL.createObjectURL` → `<a download>` click → `URL.revokeObjectURL`
- Both buttons: `size="sm"` + `min-h-[44px]` for touch targets

**File:** `frontend/app/results/[job_id]/page.tsx`

- Added `useQuery` import from `@tanstack/react-query`
- Added `JobRole` type import
- Added `ExportStickyBar` import
- Added `useQuery<JobRole[]>` hook for `/api/v1/job-roles` with `staleTime: Infinity`
- Added `isComplete` derived variable
- Main element conditionally adds `pb-16` class when `isComplete`
- `<ResultsTabs result={data} jobRoles={jobRolesData ?? []} />` passes job roles
- `<ExportStickyBar>` rendered just before `</main>` with `jobId`, `analysisStatus={data.status}`, `topSuggestionText={data.suggestions?.[0]?.suggestions?.[0]?.text}`

## Verification Results

- ✅ `npx tsc --noEmit` — exit 0, no type errors
- ✅ `npm run lint` — ✔ No ESLint warnings or errors
- ✅ `npm run build` — production build successful, all routes compiled

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed ESLint `curly` rule violations in export-sticky-bar.tsx**
- **Found during:** Task 2 lint run
- **Issue:** `if (!response.ok) throw new Error(...)` and `if (analysisStatus !== "complete") return null` triggered ESLint `curly` rule requiring braces
- **Fix:** Wrapped both single-statement if-bodies in `{ }` curly braces
- **Files modified:** `frontend/components/results/export-sticky-bar.tsx`
- **Commit:** `1b515cd`

## Known Stubs

None — all components are wired to real data sources:
- Tab 5 Compare uses `result.comparison_result` / `result.comparison_status` from polling
- ExportStickyBar uses `result.suggestions?.[0]?.suggestions?.[0]?.text` for clipboard
- PDF download calls real backend endpoint `/api/v1/jobs/{id}/export/pdf`
- Job roles dropdown calls real backend endpoint `/api/v1/job-roles`

## Phase 4 Wave Completion

All 6 plans in Phase 4 (04-01 through 04-06) are now complete:
- Wave 1 (04-01): SSE infrastructure + useCompareCv hook
- Wave 2 (04-02, 04-03): CompareTab input form + backend comparison endpoint
- Wave 3 (04-04, 04-05): MatchScoreCard, SkillsGapDisplay, MissingQualificationsList, ComparisonSkeleton, SuggestionBeforeAfter
- Wave 4 (04-06): Final assembly — Tab 5 wiring + ExportStickyBar + SuggestionCard toggle

## Self-Check: PASSED

Files exist:
- `frontend/components/results/export-sticky-bar.tsx` ✓
- `frontend/components/results/results-tabs.tsx` (modified) ✓
- `frontend/components/results/suggestion-card.tsx` (modified) ✓
- `frontend/app/results/[job_id]/page.tsx` (modified) ✓

Commits exist:
- `134e375` — feat(04-06): add Tab 5 Compare to ResultsTabs + embed SuggestionBeforeAfter toggle ✓
- `1b515cd` — feat(04-06): create ExportStickyBar + wire into results page ✓
