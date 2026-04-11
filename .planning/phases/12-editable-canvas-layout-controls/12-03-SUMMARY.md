---
phase: 12-editable-canvas-layout-controls
plan: "03"
wave: 3
subsystem: frontend/canvas
tags: [tiptap, canvas, preview, reorder, spacing, responsive, accessibility]

dependency_graph:
  requires:
    - 12-01  # SuggestionHighlight mark, SectionBlock, CanvasEditor base
    - 12-02  # EditorToolbar, SuggestionTooltip, useDraftSave, PATCH endpoint
  provides:
    - CVPreview component (live mark-free preview via generateHTML)
    - CanvasSplitPanel responsive split layout
    - Per-section reorder (up/down arrow buttons)
    - Per-section spacing toggle (Compact/Normal/Spacious)
    - Workspace page metadata (title + description)
  affects:
    - frontend/components/workspace/canvas/canvas-editor.tsx
    - frontend/components/workspace/canvas/section-block.tsx

tech_stack:
  added:
    - "@tiptap/html generateHTML (already installed from Wave 1)"
    - "lucide-react ChevronUp / ChevronDown"
  patterns:
    - "generateHTML in useMemo — browser-only, guarded by 'use client'"
    - "Immutable array swap for reorder (spread + destructuring assignment)"
    - "Spacing value mapped to Tailwind class via lookup record"
    - "CanvasSplitPanel editorSlot pattern (ReactNode prop) for clean separation"

key_files:
  created:
    - frontend/components/workspace/canvas/cv-preview.tsx
    - frontend/components/workspace/canvas/canvas-split-panel.tsx
  modified:
    - frontend/components/workspace/canvas/section-block.tsx
    - frontend/components/workspace/canvas/canvas-editor.tsx
    - frontend/app/workspace/[job_id]/page.tsx

decisions:
  - "Used StarterKit-only extensions in CVPreview (no SuggestionHighlight) to guarantee mark-free output"
  - "editorSlot is a ReactNode prop (not render prop) — simpler API, sufficient for static list"
  - "Spacing stored in SectionState (local React state only) — not persisted to backend draft_content (out of scope for Phase 12)"
  - "back-to-homepage link was already correctly href='/' — no code change needed, verified only"
  - "Sonner toast.error already present in use-draft-save.ts from Wave 2 — verified, no change needed"

metrics:
  duration: "~35 minutes"
  completed: "2026-04-11"
  tasks_completed: 3
  tasks_total: 3
  files_created: 2
  files_modified: 3
---

# Phase 12 Plan 03: Wave 3 — Split-Panel Preview, Reorder, Spacing Summary

**One-liner:** Live split-panel CV preview via `generateHTML` (mark-free), per-section up/down reorder with aria, and Compact/Normal/Spacious spacing toggle wired into CanvasSplitPanel.

## Tasks Completed

| # | Task | Commit | Key Files |
|---|------|--------|-----------|
| 1 | CVPreview + CanvasSplitPanel components | `0d27f19` | `cv-preview.tsx`, `canvas-split-panel.tsx` |
| 2 | Section reorder + spacing toggle + CanvasSplitPanel wiring | `9c60bf6` | `section-block.tsx`, `canvas-editor.tsx` |
| 3 | Workspace page metadata + ESLint + final checks | `67a600f` | `app/workspace/[job_id]/page.tsx` |

## Files Created

### `frontend/components/workspace/canvas/cv-preview.tsx`
- `CVPreview` component: renders sections as a styled dark card (`bg-[#141414]`) with cream text
- `SectionPreview`: uses `generateHTML(json, [StarterKit])` inside `useMemo` — browser-only, mark-free
- **No `SuggestionHighlight` extension passed** — ensures clean CV view without stabilo marks
- Empty state renders "Start editing sections to see the preview."

### `frontend/components/workspace/canvas/canvas-split-panel.tsx`
- `CanvasSplitPanel`: responsive flex layout — `flex-col` on mobile, `lg:flex-row` on desktop
- Left pane: 55% (`lg:basis-[55%]`), accepts `editorSlot: React.ReactNode`
- Right pane: 45% (`lg:basis-[45%]`), sticky preview (`lg:sticky lg:top-6`)
- Renders `<CVPreview sections={sections} fileName={fileName} />`

## Files Modified

### `frontend/components/workspace/canvas/section-block.tsx`
- Added props: `index`, `totalSections`, `spacing: SpacingValue`, `onReorder`, `onSpacingChange`
- Section header: `ChevronUp` / `ChevronDown` (16px) with `aria-label="Move section up/down"`
- Up disabled (`opacity-30`, `cursor-not-allowed`, `disabled`) when `index === 0`
- Down disabled when `index === totalSections - 1`
- Spacing `<select>` with `aria-label="Section spacing"` — Compact / Normal / Spacious options
- `SPACING_PADDING` record maps `SpacingValue → py-1 | py-3 | py-6`
- Editor content div: `className={px-4 ${SPACING_PADDING[spacing]}}`

### `frontend/components/workspace/canvas/canvas-editor.tsx`
- `SectionState` extended: `spacing: SpacingValue` (default `"normal"`)
- `handleReorder(index, direction)`: immutable swap using spread + destructuring
- `handleSpacingChange(sectionType, spacing)`: updates spacing for that section only
- Replaced `<div className="space-y-4">` loop with `<CanvasSplitPanel editorSlot={...} />`
- All new props (`index`, `totalSections`, `spacing`, `onReorder`, `onSpacingChange`) passed to `<SectionBlock>`

### `frontend/app/workspace/[job_id]/page.tsx`
- Added `export const metadata: Metadata` with title `"Workspace | CV Analyzer"` and description

## Verification Results

| Check | Result |
|-------|--------|
| `npx tsc --noEmit` (Task 1) | ✅ Exit 0 — no errors |
| `npx tsc --noEmit` (Task 2) | ✅ Exit 0 — no errors |
| `npm run lint` (Task 3) | ✅ Exit 0 — only pre-existing max-len warnings |
| `npx tsc --noEmit` (final) | ✅ Exit 0 — no errors |
| Backend `from app.main import app` | ✅ Exit 0 — OCR warning is pre-existing |

## Must-Have Truths Checklist

| Truth | Status |
|-------|--------|
| Workspace shows editor left + live preview right (55/45 on lg+) | ✅ CanvasSplitPanel lg:basis-[55%]/[45%] |
| On screens < lg, editor and preview stack vertically (editor on top) | ✅ flex-col default, lg:flex-row |
| Preview renders as styled dark card with cream text | ✅ bg-[#141414] px-8 py-10, text-[#F5F2D8] |
| Preview updates in real-time as user types | ✅ sections state flows down, useMemo re-runs on json change |
| Preview does NOT show stabilo highlight marks | ✅ PREVIEW_EXTENSIONS = [StarterKit] only |
| Each section block has Up and Down arrow buttons | ✅ ChevronUp/ChevronDown in header |
| Topmost Up disabled, bottom Down disabled | ✅ index===0 / index===totalSections-1 |
| Compact/Normal/Spacious spacing selector | ✅ <select> with three options |
| Spacing selector changes vertical padding | ✅ py-1 / py-3 / py-6 via SPACING_PADDING |
| Failed PATCH save triggers Sonner error toast | ✅ Pre-existing in use-draft-save.ts (Wave 2) |
| 'Back to homepage' link navigates to '/' | ✅ Already href="/" in workspace-shell.tsx |
| Workspace page title is 'Workspace | CV Analyzer' | ✅ metadata export added |
| All interactive elements have aria-labels | ✅ "Move section up", "Move section down", "Section spacing" |

## Deviations from Plan

### Findings that required no action

**1. Back-to-homepage link already correct**
- **Found during:** Task 3 pre-check
- **Issue:** Plan specified to fix this, but `workspace-shell.tsx` already had `<Link href="/">` pointing to `/`
- **Action:** Verified only, no code change needed

**2. Sonner toast already implemented**
- **Found during:** Task 3 pre-check
- **Issue:** Plan said to verify Wave 2 had toast.error — confirmed present in `use-draft-save.ts`
- **Action:** Verified only, no code change needed

## Self-Check

All created/modified files verified present. All 3 task commits confirmed in git log.

| Item | Status |
|------|--------|
| `cv-preview.tsx` | ✅ FOUND |
| `canvas-split-panel.tsx` | ✅ FOUND |
| `section-block.tsx` | ✅ FOUND (modified) |
| `canvas-editor.tsx` | ✅ FOUND (modified) |
| `app/workspace/[job_id]/page.tsx` | ✅ FOUND (verified via view tool — PowerShell glob issue with `[]`) |
| commit `0d27f19` | ✅ FOUND |
| commit `9c60bf6` | ✅ FOUND |
| commit `67a600f` | ✅ FOUND |

**Self-Check: PASSED**
