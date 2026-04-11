---
phase: 12-editable-canvas-layout-controls
plan: "01"
subsystem: frontend/canvas + backend/models
tags:
  - tiptap
  - rich-text-editor
  - canvas
  - workspace
  - alembic-migration
  - tdd

dependency_graph:
  requires:
    - "11-01: workspace-shell.tsx + WorkspaceHydration types"
    - "09: Mathical design system (cream/dark palette, Bricolage font)"
  provides:
    - "SuggestionHighlight Tiptap Mark extension (Wave 2 stabilo marks)"
    - "SectionBlock component — one Tiptap editor per CV section"
    - "CanvasEditor component — manages sections state, renders SectionBlocks"
    - "workspace_draft JSONB column on jobs table (Wave 2 persistence)"
  affects:
    - "frontend/components/workspace/workspace-shell.tsx (center panel replaced)"
    - "backend/alembic — migration chain extended to f9f23d731d78"

tech_stack:
  added:
    - "@tiptap/react@3.22.3"
    - "@tiptap/starter-kit@3.22.3"
    - "@tiptap/extension-placeholder@3.22.3"
    - "@tiptap/pm@3.22.3"
    - "@tiptap/html@3.22.3"
    - "use-debounce@10.1.1"
    - "@radix-ui/react-tooltip (via shadcn tooltip)"
    - "vitest@4.1.4 + @testing-library/react (test infrastructure)"
  patterns:
    - "useEditor({ immediatelyRender: false }) — Next.js 15 SSR safety pattern"
    - "useEditorState() — reactive focus state in Tiptap v3"
    - "plainTextToTiptapDoc() — plain text → ProseMirror doc JSONContent"
    - "TDD RED/GREEN cycle — vitest + jsdom unit tests"

key_files:
  created:
    - "frontend/lib/tiptap/suggestion-highlight.ts"
    - "frontend/components/workspace/canvas/section-block.tsx"
    - "frontend/components/workspace/canvas/canvas-editor.tsx"
    - "frontend/components/workspace/canvas/canvas.test.ts"
    - "frontend/components/ui/tooltip.tsx"
    - "frontend/vitest.config.ts"
    - "frontend/vitest.setup.ts"
    - "backend/alembic/versions/20260411_2210_f9f23d731d78_add_workspace_draft_to_jobs.py"
  modified:
    - "frontend/components/workspace/workspace-shell.tsx"
    - "frontend/package.json"
    - "backend/app/models/job.py"

decisions:
  - "immediatelyRender: false enforced on all useEditor() calls — prevents Next.js 15 SSR hydration mismatch"
  - "StarterKit v3 used directly — no @tiptap/extension-history installed (StarterKit includes UndoRedo via @tiptap/extensions)"
  - "Removed auto-generated drop_index for knowledge_chunks_embedding_idx from migration — hnsw vector index is unrecognized by alembic autogenerate and should not be dropped"
  - "vitest + jsdom chosen for test infrastructure (matches Vite ecosystem used by project)"
  - "plainTextToTiptapDoc exported from section-block.tsx — testable pure function, reused in canvas-editor"

metrics:
  duration_minutes: 15
  completed_date: "2026-04-11"
  tasks_completed: 3
  files_created: 8
  files_modified: 3
---

# Phase 12 Plan 01: Wave 1 — Tiptap Install, SectionBlock, CanvasEditor, workspace_draft Migration Summary

**One-liner:** Installed Tiptap v3 (StarterKit + Placeholder + custom SuggestionHighlight Mark), built `SectionBlock`/`CanvasEditor` components with `immediatelyRender: false` SSR safety, wired them into workspace-shell center panel, and added `workspace_draft JSONB` column to the jobs table via Alembic migration `f9f23d731d78`.

---

## What Was Built

### Task 1 — Tiptap packages + shadcn Tooltip + SuggestionHighlight

**Packages installed** (in `frontend/`):
- `@tiptap/react@3.22.3`, `@tiptap/starter-kit@3.22.3`, `@tiptap/extension-placeholder@3.22.3`, `@tiptap/pm@3.22.3`, `@tiptap/html@3.22.3`
- `use-debounce@10.1.1` (for Wave 2 debounced save)
- **NOT installed:** `@tiptap/extension-history` — StarterKit v3 already includes UndoRedo via `@tiptap/extensions`

**shadcn Tooltip** installed via `npx shadcn@latest add tooltip` → creates `frontend/components/ui/tooltip.tsx` using `@radix-ui/react-tooltip`.

**`frontend/lib/tiptap/suggestion-highlight.ts`**:
- Custom Tiptap `Mark` extension named `suggestionHighlight`
- Attributes: `suggestionId` (string), `color` (hex, default `#CAFF43`)
- `renderHTML`: returns `<mark>` with `background-color: {color}66` (40% opacity stabilo effect), `border-radius: 2px`, `role="mark"`
- Commands: `setSuggestionHighlight({ suggestionId, color })` and `unsetSuggestionHighlight(suggestionId)`
- `excludes: ""` — coexists with bold/italic marks
- TypeScript command augmentation via `declare module "@tiptap/core"`

### Task 2 — SectionBlock + CanvasEditor (TDD)

**Test infrastructure** (first TDD task): vitest v4 + jsdom + @testing-library/react installed and configured with `vitest.config.ts` + `vitest.setup.ts`.

**RED phase**: `canvas.test.ts` written with 4 failing tests for `plainTextToTiptapDoc` — import error confirmed (file didn't exist yet).

**GREEN phase**:

**`frontend/components/workspace/canvas/section-block.tsx`**:
- `"use client"` — Tiptap requires browser APIs
- `useEditor({ immediatelyRender: false })` — CRITICAL Next.js 15 SSR safety
- Extensions: `[StarterKit, Placeholder.configure({ placeholder: 'Start editing this section...' }), SuggestionHighlight]`
- Skeleton loading state when `editor === null` (during SSR hydration)
- `useEditorState()` for reactive `isFocused` (editor.isFocused is not reactive in Tiptap v3)
- Focused state: `border-[#CAFF43]/60 bg-white`; unfocused: `border-border bg-white/80`
- Section type header pill (`bg-[#141414] text-[#F5F2D8]`)
- `onUpdate` fires only on actual content changes (JSON diff check via `lastContentRef`)
- Exports: `SectionBlock`, `plainTextToTiptapDoc`

**`frontend/components/workspace/canvas/canvas-editor.tsx`**:
- `"use client"` — state management requires browser
- `useState<SectionState[]>` initialized from `buildInitialSections(rawSections, null)` (Wave 2 replaces `null` with draft content)
- Fallback: if `sections.length === 0`, falls back to single `document` block from `source_text`
- Maps `SuggestionCard.section` to section blocks by case-insensitive `toLowerCase()` match
- Empty state: friendly message if no sections found
- Exports: `CanvasEditor`

**Tests passing**: 4/4 `plainTextToTiptapDoc` unit tests:
- 2-line text → doc with 2 paragraph nodes ✓
- Single line → 1 paragraph ✓
- Empty string → doc with empty paragraph ✓
- Blank line → empty paragraph node ✓

### Task 3 — workspace-shell wiring + backend migration

**`frontend/components/workspace/workspace-shell.tsx`**:
- Added import: `import { CanvasEditor } from "@/components/workspace/canvas/canvas-editor"`
- Replaced entire center `<section className="p-4">` block (lines 231–345) with `<CanvasEditor data={data} />`
- Removed `sourceBlocks` variable (no longer needed — CanvasEditor reads from `data` directly)
- Kept `getSuggestionCount`, `getSectionCount`, `getGapLines` helpers (still used in left/right rails)

**`backend/app/models/job.py`**:
- Added `workspace_draft = Column(JSONB, nullable=True)` after `jd_role_id`
- `JSONB` already imported (was used for `nlp_result`, `scores`, `suggestions` etc.)

**Alembic migration** `20260411_2210_f9f23d731d78_add_workspace_draft_to_jobs.py`:
- Revision ID: `f9f23d731d78`
- Adds `workspace_draft` JSONB column to `jobs` table
- Removed auto-generated `op.drop_index('knowledge_chunks_embedding_idx')` (hnsw vector index incorrectly detected by autogenerate — preserved in DB)
- Applied: `alembic upgrade head` → `f9f23d731d78 (head)` ✓

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unwanted knowledge_chunks index drop from migration**
- **Found during:** Task 3 — migration autogenerate
- **Issue:** Alembic autogenerate detected `knowledge_chunks_embedding_idx` (hnsw pgvector index) as "removed" because it uses PostgreSQL-specific syntax not fully recognized by alembic's comparison engine
- **Fix:** Manually removed `op.drop_index('knowledge_chunks_embedding_idx', ...)` from upgrade() and removed corresponding `op.create_index(...)` from downgrade(). Migration only adds `workspace_draft` column.
- **Files modified:** `backend/alembic/versions/20260411_2210_f9f23d731d78_add_workspace_draft_to_jobs.py`
- **Commit:** `b8a04e8`

**2. [Rule 2 - Missing critical functionality] Set up test infrastructure (first TDD task)**
- **Found during:** Task 2 TDD setup
- **Issue:** No test framework existed in the project; vitest + jsdom required for TDD RED/GREEN cycle
- **Fix:** Installed `vitest@4.1.4`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`. Added `vitest.config.ts`, `vitest.setup.ts`, and `test`/`test:watch` scripts to `package.json`
- **Files modified:** `frontend/package.json`, `frontend/vitest.config.ts`, `frontend/vitest.setup.ts`
- **Commit:** `555a95c`

**3. [Rule 1 - Bug] Fixed ESLint curly brace errors in suggestion-highlight.ts**
- **Found during:** Post-task lint verification
- **Issue:** ESLint `curly` rule requires braces after `if` conditions; `if (!node.isText) return;` and `if (changed && dispatch) dispatch(tr);` violated this
- **Fix:** Added braces: `if (!node.isText) { return; }` and `if (changed && dispatch) { dispatch(tr); }`
- **Files modified:** `frontend/lib/tiptap/suggestion-highlight.ts`
- **Commit:** `3530818`

---

## Key Technical Notes

### immediatelyRender: false (CRITICAL)
Every `useEditor()` call has `immediatelyRender: false`. This is required for Next.js 15 App Router (React Server Components + Hydration). Without it, Tiptap throws a hydration mismatch error because ProseMirror renders different content server-side vs client-side.

### Alembic Revision ID
`f9f23d731d78` — applied and confirmed as `(head)` via `alembic current`.

### No @tiptap/extension-history
StarterKit v3 includes UndoRedo via `@tiptap/extensions`. Installing `@tiptap/extension-history` separately would break the undo stack (duplicate history). The plan explicitly prohibits this.

---

## Known Stubs

| Stub | File | Line | Reason |
|------|------|------|--------|
| `buildInitialSections(rawSections, null)` — null = no draft | `canvas-editor.tsx` | ~38 | Wave 2 replaces `null` with `data.document.draft_content` from backend |
| Toolbar placeholder comment | `section-block.tsx` | ~83 | Wave 2 inserts `<EditorToolbar editor={editor} isFocused={isFocused} />` |
| `// Wave 2: call markUnsaved(...)` comment | `canvas-editor.tsx` | ~48 | Wave 2 adds debounced save mutation |
| `// Wave 2: UnsavedIndicator inserted here` comment | `canvas-editor.tsx` | ~65 | Wave 2 renders unsaved indicator |

All stubs are intentional Wave 1 scaffolding per plan objective ("editable but no stabilo marks, no save, no split preview yet"). Future waves resolve each stub.

---

## Threat Flags

None — no new network endpoints, auth paths, or file access patterns introduced in Wave 1. The `workspace_draft` JSONB column is nullable and currently write-only via future PATCH endpoint (Wave 2). Aligns with T-12-04 `accept` disposition in plan's threat model.

---

## Self-Check: PASSED

**Files created:**
- ✅ `frontend/lib/tiptap/suggestion-highlight.ts`
- ✅ `frontend/components/workspace/canvas/section-block.tsx`
- ✅ `frontend/components/workspace/canvas/canvas-editor.tsx`
- ✅ `frontend/components/workspace/canvas/canvas.test.ts`
- ✅ `frontend/components/ui/tooltip.tsx`
- ✅ `frontend/vitest.config.ts`
- ✅ `frontend/vitest.setup.ts`
- ✅ `backend/alembic/versions/20260411_2210_f9f23d731d78_add_workspace_draft_to_jobs.py`

**Commits verified:**
- `0681851` — Task 1: packages + tooltip + SuggestionHighlight
- `555a95c` — TDD RED: failing tests
- `122569b` — TDD GREEN: SectionBlock + CanvasEditor
- `b8a04e8` — Task 3: workspace-shell + Job model + migration
- `3530818` — fix: lint errors

**TypeScript:** `npx tsc --noEmit` exits 0 — clean

**Tests:** 4/4 passing

**Alembic:** `f9f23d731d78 (head)` confirmed

**Backend import:** `from app.main import app; print('OK')` → OK
