---
phase: "04-streaming-comparison"
plan: "04"
subsystem: "frontend/types + frontend/components/results"
tags: ["typescript", "types", "sse", "compare-tab", "match-score-card", "phase-4"]
dependency_graph:
  requires: ["04-01"]
  provides: ["ComparisonResult type", "JobRole type", "SkillGapGroup type", "comparing_job STAGE_MAP key", "CompareTab component", "MatchScoreCard component"]
  affects: ["frontend/lib/types.ts", "frontend/components/upload/processing-stages.tsx", "frontend/components/results/"]
tech_stack:
  added: []
  patterns: ["TypeScript interface extension", "React state machine (idle/loading/complete/error)", "Tailwind threshold color helper functions", "shadcn Progress bars"]
key_files:
  created:
    - frontend/components/results/compare-tab.tsx
    - frontend/components/results/match-score-card.tsx
  modified:
    - frontend/lib/types.ts
    - frontend/components/upload/processing-stages.tsx
decisions:
  - "SkillGapGroup uses present/missing/partial fields (plan spec) over category/matched/missing (context summary) — plan is authoritative"
  - "MatchScoreCard threshold labels use 85/70/50 cutoffs per architecture docs (Excellent/Good/Fair/Low)"
  - "Education breakdown uses match_pct as proxy since LLM output schema doesn't include education-specific data"
  - "comparing stage added to stages array before complete; always visible as pending until reached"
metrics:
  duration: "~15 minutes"
  completed_date: "2026-04-06T17:26:49Z"
  tasks_completed: 2
  files_modified: 4
---

# Phase 04 Plan 04: TypeScript types + STAGE_MAP + CompareTab + MatchScoreCard Summary

**One-liner:** Phase 4 TypeScript type contracts + SSE comparing_job stage + CompareTab (idle/loading/error states) + MatchScoreCard (threshold colors + Progress breakdown bars).

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | TypeScript types extension + SSE stage update | `5ce5010` | `frontend/lib/types.ts`, `frontend/components/upload/processing-stages.tsx` |
| 2 | CompareTab + MatchScoreCard components | `74919df` | `frontend/components/results/compare-tab.tsx`, `frontend/components/results/match-score-card.tsx` |

## What Was Built

### Task 1 — Types + STAGE_MAP

**`frontend/lib/types.ts`** — Extended with Phase 4 interfaces:
- `ComparisonResult` — LLM comparison output (match_pct, matched/missing skills & experience, overall_recommendation)
- `SkillGapGroup` — Skills grouped by present/missing/partial for SkillsGapDisplay (Wave 3)
- `JobRole` — Job role summary for comparison dropdown (id, title, seniority, industry)
- `ExportOptions` — Export sticky bar options (jobId, topSuggestionText)
- `AnalysisResult` — Extended with `comparison_result?: ComparisonResult | null` and `comparison_status` fields; `"comparing"` added to status union

**`frontend/components/upload/processing-stages.tsx`** — Extended:
- `comparing_job: "comparing"` added to STAGE_MAP (maps backend SSE stage → UI stage)
- `{ id: "comparing", label: "Comparing against job description" }` added to stages array before `complete`

### Task 2 — CompareTab + MatchScoreCard

**`frontend/components/results/compare-tab.tsx`** — New component:
- 4 states: idle (textarea + CTA) | loading (skeleton) | complete (children slot) | error (retry button)
- `"Compare CV"` button disabled when `jdText.trim().length < 50` per UI-SPEC §7.1
- Textarea: `min-h-[160px] resize-y`, placeholder "Paste the job description here…"
- Optional job role selector dropdown (shown only when `jobRoles.length > 0`)
- POSTs to `/api/v1/jobs/${jobId}/compare` with `{ jd_text, jd_role_id? }` body
- Empty state CTA: "Compare your CV to a job" with description text

**`frontend/components/results/match-score-card.tsx`** — New component:
- `text-3xl font-bold` score numeral with threshold color (green-500 / primary / amber-500 / destructive)
- Threshold label: "Excellent match" (≥85) / "Good match" (≥70) / "Fair match" (≥50) / "Low match" (<50)
- Three Progress bars (h-2): Skills (matched_skills ratio), Experience (matched_experience ratio), Education (match_pct proxy)
- `overall_recommendation` block with top border separator

## Decisions Made

1. **SkillGapGroup fields** — Used `present/missing/partial` from plan spec rather than `category/matched/missing` from context summary. Plan is the authoritative implementation source.

2. **Threshold label cutoffs** — Used 85/70/50/<50 per architecture context docs (Excellent/Good/Fair/Low), aligning with decision D-C1.

3. **Education breakdown** — Uses `match_pct` as proxy since the LLM output schema doesn't expose education-specific match data. Documented in code comments.

4. **comparing stage visibility** — Stage added directly to stages array (no conditional logic); existing loop renders it as pending until reached, which is the correct progressive-disclosure UX.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed ESLint eqeqeq + curly violations**
- **Found during:** Task 2 lint check
- **Issue:** Plan code used `!= null` (eqeqeq violation) and single-line if statements without braces (curly rule violation) in both new components
- **Fix:** Changed `!= null` → `!== null`; wrapped all single-line if bodies in `{ }`
- **Files modified:** `compare-tab.tsx`, `match-score-card.tsx`
- **Commit:** `74919df` (fixed before commit)

**2. [Rule 2 - Convention] Removed banned gap-3 / space-y-3 patterns**
- **Found during:** Task 2 implementation review
- **Issue:** Plan template used `gap-3` and `space-y-3` which are banned per UI conventions
- **Fix:** Used `gap-4` and `space-y-4` throughout new components
- **Files modified:** `match-score-card.tsx`
- **Commit:** `74919df`

## Known Stubs

- **Education breakdown** in `MatchScoreCard` (`frontend/components/results/match-score-card.tsx`, line ~55): Uses `result.match_pct` as a proxy for Education score. The LLM output schema (`ComparisonResult`) does not include education-specific match data. This is intentional — a future plan should either extend the LLM prompt/schema to return education data or remove the Education row from the breakdown.

## Wave 2 Completion Checklist

- [x] TypeScript types exported from `types.ts` (ComparisonResult, SkillGapGroup, JobRole, ExportOptions)
- [x] AnalysisResult extended with comparison_result + comparison_status fields
- [x] STAGE_MAP has `comparing_job` key → maps to `"comparing"` UI stage
- [x] stages array includes `{ id: 'comparing', label: 'Comparing against job description' }`
- [x] CompareTab renders idle state correctly (textarea + disabled "Compare CV" when < 50 chars)
- [x] MatchScoreCard renders threshold colors (green/primary/amber/destructive)
- [x] MatchScoreCard renders Progress bars for Skills, Experience, Education
- [x] `npm run lint` passes (no warnings or errors)
- [x] `npx tsc --noEmit` passes (exit 0)

## Self-Check: PASSED

Files exist:
- ✅ `frontend/lib/types.ts` — modified with Phase 4 types
- ✅ `frontend/components/upload/processing-stages.tsx` — comparing_job in STAGE_MAP
- ✅ `frontend/components/results/compare-tab.tsx` — created
- ✅ `frontend/components/results/match-score-card.tsx` — created

Commits exist:
- ✅ `5ce5010` — feat(04-04): add Phase 4 TypeScript types and comparing_job to STAGE_MAP
- ✅ `74919df` — feat(04-04): add CompareTab and MatchScoreCard components
