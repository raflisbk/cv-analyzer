---
phase: "04-streaming-comparison"
plan: "05"
subsystem: frontend
tags: [components, comparison, ui, wave-3]
dependency_graph:
  requires: ["04-04"]
  provides: ["skills-gap-display", "missing-qualifications-list", "comparison-skeleton", "suggestion-before-after"]
  affects: ["compare-tab", "04-06-suggestion-card"]
tech_stack:
  added: []
  patterns: ["shadcn/ui Badge", "shadcn/ui Skeleton", "lucide-react icons", "CSS max-h transition", "ARIA accessibility"]
key_files:
  created:
    - frontend/components/results/skills-gap-display.tsx
    - frontend/components/results/missing-qualifications-list.tsx
    - frontend/components/results/comparison-skeleton.tsx
    - frontend/components/results/suggestion-before-after.tsx
  modified: []
decisions:
  - "Partial badge group hidden via conditional render (not CSS visibility) per UI-SPEC §7.3"
  - "MissingQualificationsList severity assigned by index position (no per-item severity in LLM schema)"
  - "SuggestionBeforeAfter uses beforeText + id props (not before/after) per plan code spec"
  - "gap-1 in text block replaced with gap-2 for 8-point grid compliance"
  - "curly braces added to if statements in getSeverity() to pass ESLint curly rule"
metrics:
  duration: "~10 minutes"
  completed: "2025-01-30"
  tasks_completed: 2
  files_created: 4
  files_modified: 0
---

# Phase 04 Plan 05: Display Components for Compare Tab Summary

## One-liner
Four Compare Tab display components: badge-cluster skill gap, severity-icon qualifications list, 3-section shimmer skeleton, and ARIA-accessible before/after toggle.

## What Was Built

### Task 1: SkillsGapDisplay + MissingQualificationsList
**Commit:** `bebf2ff`

**SkillsGapDisplay** (`frontend/components/results/skills-gap-display.tsx`):
- Renders green (`bg-green-50 text-green-700 border-green-200`) badge cluster for `matched_skills`
- Renders red (`bg-red-50 text-red-700 border-red-200`) badge cluster for `missing_skills`
- Renders amber (`bg-amber-50 text-amber-700 border-amber-200`) badge cluster for optional `partial` prop
- **Partial group hidden entirely** when `partial.length === 0` via conditional render (not CSS)
- Empty state text for each group when arrays are empty
- Props: `result: ComparisonResult`, `partial?: string[]`

**MissingQualificationsList** (`frontend/components/results/missing-qualifications-list.tsx`):
- Renders `AlertCircle` (critical, red), `AlertTriangle` (moderate, amber), `Info` (minor, slate) icons from `lucide-react`
- Severity auto-assigned by array position: first third → critical, mid → moderate, rest → minor
- Derives items from `result.missing_experience`
- Empty state message when all qualifications met
- Layout: `flex items-start gap-2` per item, `flex flex-col gap-2` for text block

### Task 2: ComparisonSkeleton + SuggestionBeforeAfter
**Commit:** `e581d25`

**ComparisonSkeleton** (`frontend/components/results/comparison-skeleton.tsx`):
- 3-section shimmer loading state mirroring full comparison results layout
- Section 1: MatchScoreCard skeleton (h-8 title + h-4 label + three h-2 progress bars)
- Section 2: SkillsGapDisplay skeleton (3 rows × 4 pill skeletons with `rounded-full`)
- Section 3: MissingQualificationsList skeleton (4 full-width rows)
- `role="status"` + `aria-label` for accessibility per UI-SPEC §7.7

**SuggestionBeforeAfter** (`frontend/components/results/suggestion-before-after.tsx`):
- `"use client"` — client component with `useState` toggle
- `aria-expanded` + `aria-controls` on Button; `role="region"` + `aria-labelledby` on collapsible div
- CSS `max-h-0` → `max-h-96` with `transition-all duration-200` for collapse/expand
- Button text toggles: "Show original context" / "Hide original context"
- ChevronDown / ChevronUp icons from `lucide-react`
- Props: `beforeText: string`, `id: string` (for unique ARIA IDs per suggestion card)

## Verification

All acceptance criteria pass:
- ✅ `SkillsGapDisplay` export found
- ✅ `bg-green-50 text-green-700 border-green-200` Badge className present
- ✅ `bg-red-50 text-red-700 border-red-200` Badge className present
- ✅ `partial.length > 0` conditional render present
- ✅ `MissingQualificationsList` export found
- ✅ `AlertCircle`, `AlertTriangle`, `Info` icons imported
- ✅ `ComparisonSkeleton` export found with `rounded-full` pill skeletons
- ✅ `SuggestionBeforeAfter` export found
- ✅ `aria-expanded`, `aria-controls`, `role="region"` all present
- ✅ `max-h-0`, `max-h-96`, `transition-all duration-200` all present
- ✅ `npm run lint` — passes (0 warnings, 0 errors)
- ✅ `npx tsc --noEmit` — exits 0

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed ESLint `curly` rule violation in getSeverity()**
- **Found during:** Task 1 lint run
- **Issue:** `getSeverity()` used single-line if statements without curly braces; ESLint `curly` rule required `{ }` around all if bodies
- **Fix:** Added curly braces to all 3 if statements in `getSeverity()`
- **Files modified:** `frontend/components/results/missing-qualifications-list.tsx`
- **Commit:** included in `bebf2ff`

**2. [Rule 2 - Convention] Changed gap-1 to gap-2 in text blocks**
- **Found during:** Task 1 review against banned pattern list
- **Issue:** Plan code had `gap-1` in flex column text blocks; project 8-point grid only allows `gap-2`, `gap-4`, `gap-6`, `gap-8`
- **Fix:** Changed `gap-1` → `gap-2` in MissingQualificationsList and SuggestionBeforeAfter text blocks
- **Files modified:** `frontend/components/results/missing-qualifications-list.tsx`, `frontend/components/results/suggestion-before-after.tsx`

**3. [Rule 2 - Convention] Changed mt-3/pt-3 to mt-4/pt-4 in SuggestionBeforeAfter**
- **Found during:** Task 2 review against banned pattern list
- **Issue:** Plan code had `mt-3` and `pt-3`; project 8-point grid spacing should use multiples of 4
- **Fix:** Changed `mt-3` → `mt-4`, `pt-3` → `pt-4`
- **Files modified:** `frontend/components/results/suggestion-before-after.tsx`

## Known Stubs

None — all components are fully wired to `ComparisonResult` data. `SuggestionBeforeAfter` receives `beforeText` as a prop, which will be provided by `SuggestionCard` in Wave 4 (04-06).

## Self-Check: PASSED

Files verified to exist:
- ✅ `frontend/components/results/skills-gap-display.tsx`
- ✅ `frontend/components/results/missing-qualifications-list.tsx`
- ✅ `frontend/components/results/comparison-skeleton.tsx`
- ✅ `frontend/components/results/suggestion-before-after.tsx`

Commits verified:
- ✅ `bebf2ff` — feat(04-05): add SkillsGapDisplay and MissingQualificationsList components
- ✅ `e581d25` — feat(04-05): add ComparisonSkeleton and SuggestionBeforeAfter components
