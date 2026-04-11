---
phase: 12-editable-canvas-layout-controls
plan: "02"
subsystem: frontend/canvas + backend/api
tags:
  - tiptap
  - rich-text-editor
  - stabilo-highlights
  - suggestion-tooltip
  - debounced-save
  - draft-persistence
  - workspace-patch

dependency_graph:
  requires:
    - "12-01: SectionBlock + CanvasEditor + SuggestionHighlight mark + workspace_draft migration"
    - "11-01: workspace-shell.tsx + WorkspaceHydration types"
  provides:
    - "EditorToolbar: 7-button formatting toolbar using useEditorState v3 API"
    - "SuggestionTooltip: portal + anchorRect pattern for ProseMirror mark hovers"
    - "applyHighlights: stabilo marks applied via onCreate callback in SectionBlock"
    - "useDraftSave: 800ms debounced PATCH with saveState transitions"
    - "UnsavedIndicator: inline component with 4 visual states"
    - "PATCH /jobs/{job_id}/workspace/content: backend draft persistence endpoint"
    - "draft_content in GET /workspace: loads saved draft on workspace open (D-12)"
  affects:
    - "frontend/components/workspace/canvas/section-block.tsx (fully replaced with Wave 2)"
    - "frontend/components/workspace/canvas/canvas-editor.tsx (Wave 2 stubs resolved)"
    - "backend/app/schemas/workspace.py (new schemas + extended payload)"
    - "backend/app/api/v1/endpoints/workspace.py (PATCH endpoint added, GET extended)"
    - "frontend/lib/workspace.ts (draft_content type added)"

tech_stack:
  added:
    - "use-debounce@10.1.1 (useDebouncedCallback in useDraftSave)"
    - "react-dom createPortal (SuggestionTooltip portal pattern)"
  patterns:
    - "portal + anchorRect pattern — SuggestionTooltip over ProseMirror DOM marks"
    - "event delegation mouseover on [data-suggestion-id] — required for ProseMirror DOM"
    - "useEditorState() — selective re-render subscription for toolbar active states"
    - "useDebouncedCallback(800ms, maxWait:5000) — debounced PATCH with forced flush"
    - "setSections inside functional updater — captures latest state for markUnsaved"

key_files:
  created:
    - "frontend/components/workspace/canvas/editor-toolbar.tsx"
    - "frontend/components/workspace/canvas/suggestion-tooltip.tsx"
    - "frontend/hooks/use-draft-save.ts"
  modified:
    - "frontend/components/workspace/canvas/section-block.tsx"
    - "frontend/components/workspace/canvas/canvas-editor.tsx"
    - "frontend/lib/workspace.ts"
    - "backend/app/schemas/workspace.py"
    - "backend/app/api/v1/endpoints/workspace.py"

decisions:
  - "Portal + anchorRect for SuggestionTooltip — ProseMirror marks are DOM nodes, cannot be wrapped by Radix TooltipTrigger asChild"
  - "Event delegation mouseover on [data-suggestion-id] in SectionBlock — only reliable way to detect hover on ProseMirror-rendered mark elements"
  - "suggestion.text used as suggestionId — unique enough for CV suggestions; avoids requiring a separate ID field"
  - "setSections functional updater used in handleContentChange to capture updated array before markUnsaved — avoids stale closure"
  - "UnsavedIndicator inlined in canvas-editor.tsx — too small to warrant a separate file"

metrics:
  duration_minutes: 30
  completed_date: "2026-04-11"
  tasks_completed: 3
  files_created: 3
  files_modified: 5
---

# Phase 12 Plan 02: Wave 2 — Interactive Canvas Layer Summary

**One-liner:** Added formatting toolbar (Tiptap v3 `useEditorState`), stabilo suggestion highlights via `SuggestionHighlight` mark `onCreate`, `SuggestionTooltip` with portal+anchorRect Accept/Dismiss pattern, 800ms debounced PATCH draft persistence via `useDraftSave`, `UnsavedIndicator` with 4 visual states, and backend `PATCH /workspace/content` endpoint with `draft_content` loaded on workspace open.

---

## What Was Built

### Task 1 — EditorToolbar + SuggestionTooltip + Stabilo marks wiring

**`frontend/components/workspace/canvas/editor-toolbar.tsx`** (new):
- 7-button toolbar: Bold, Italic, Bullet list, Numbered list, Hard break, Undo, Redo
- `useEditorState` hook (Tiptap v3 API) for selective reactive re-renders — NOT `shouldRerenderOnTransaction`
- Toolbar `h-10`, visible at `opacity-100` when `isFocused=true`, `opacity-0 pointer-events-none` when false
- Each button: `aria-label`, `aria-pressed`, correct chain command, active state styling
- `TooltipProvider delayDuration={400}` wraps all buttons

**`frontend/components/workspace/canvas/suggestion-tooltip.tsx`** (new):
- Portal pattern: `createPortal(content, document.body)` — required because ProseMirror marks are DOM nodes, not React components
- Positioned above mark using `anchorRect.top + window.scrollY - 8` (fixed positioning)
- Accept: finds mark range via `doc.descendants`, `deleteRange + insertContentAt + unsetSuggestionHighlight`
- Dismiss: `editor.commands.unsetSuggestionHighlight(suggestionId)` only
- Outside-click handler via `mousedown` listener on document
- `className="suggestion-tooltip-content"` enables mouseout guard in event delegation

**`frontend/components/workspace/canvas/section-block.tsx`** (updated — Wave 2 full replacement):
- Added `findTextRange`, `getSuggestionColor`, `applyHighlights` utilities above component
- `onCreate` callback: `setTimeout(() => applyHighlights(e, suggestions), 0)` — deferred tick for doc parse
- `editorContainerRef` and `activeTooltip` state added
- Event delegation `useEffect`: `mouseover` on `[data-suggestion-id]` → `setActiveTooltip`; `mouseout` guards `.suggestion-tooltip-content`
- `<EditorToolbar editor={editor} isFocused={isFocused} />` wired (replaces Wave 1 comment)
- `<SuggestionTooltip>` conditionally rendered in `ref={editorContainerRef}` wrapper div
- Color logic: `high_impact` → `#FF4FCB`, `action_verb`/`impact_metric` → `#FF8C42`, default → `#CAFF43`

### Task 2 — Backend PATCH + Schema extensions + workspace.ts types

**`backend/app/schemas/workspace.py`** (updated):
- Added `from typing import Any` to imports
- `WorkspaceDocumentPayload.draft_content: dict | None = None` — returned in GET if saved
- New `WorkspaceContentPatch(sections: dict[str, Any])` Pydantic model
- New `WorkspaceContentSaveResult(saved: bool, updated_at: str)` Pydantic model

**`backend/app/api/v1/endpoints/workspace.py`** (updated):
- Imports: added `WorkspaceContentPatch`, `WorkspaceContentSaveResult`
- GET extended: `safe_workspace_draft = job.workspace_draft if isinstance(...) else None`; passes `draft_content=safe_workspace_draft.get("sections") if ...`
- `PATCH /jobs/{job_id}/workspace/content`: stores `{"sections": body.sections}` to `job.workspace_draft`, returns `WorkspaceContentSaveResult(saved=True, updated_at=timestamp)`
- Error handling: `db.rollback()` on exception, returns `DRAFT_SAVE_FAILED` error

**`frontend/lib/workspace.ts`** (updated):
- Added `import type { JSONContent } from "@tiptap/core"` (type-only, no runtime cost)
- `WorkspaceDocumentPayload.draft_content?: Record<string, JSONContent> | null`

### Task 3 — useDraftSave + UnsavedIndicator + CanvasEditor wiring

**`frontend/hooks/use-draft-save.ts`** (new):
- `useDebouncedCallback(fn, 800, { maxWait: 5000 })` — fire after 800ms silence, force at 5s
- `useMutation` from `@tanstack/react-query` for PATCH call
- `saveState: SaveState` — transitions: `idle → unsaved → saving → saved → idle` (1.5s auto-clear)
- On error: Sonner `toast.error("Failed to save changes — your edits are not lost. Retrying...")`
- Exports: `useDraftSave`, `SaveState` type

**`canvas-editor.tsx`** `UnsavedIndicator` inline component:
- `idle` → renders nothing
- `unsaved` → pulse orange dot + "Unsaved changes"
- `saving` → spin border dot + "Unsaved changes"
- `saved` → lime dot + "Saved" (fades after 1.5s → idle)
- `error` → destructive dot + "Save failed"

**`canvas-editor.tsx`** (fully updated):
- `useDraftSave(data.job_id)` called inside component
- `handleContentChange`: functional `setSections` updater + `markUnsaved({ sections: sectionsMap })`
- `buildInitialSections(rawSections, data.document.draft_content ?? null)` — D-12 draft loading
- `<UnsavedIndicator saveState={saveState} />` in header div

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Stub Tracking

All Wave 1 stubs from `12-01-SUMMARY.md` resolved:

| Stub (Wave 1) | Resolved in Wave 2 |
|---|---|
| `buildInitialSections(rawSections, null)` | Replaced with `data.document.draft_content ?? null` |
| Toolbar placeholder comment in section-block | Replaced with `<EditorToolbar editor={editor} isFocused={isFocused} />` |
| `// Wave 2: call markUnsaved(...)` comment | Replaced with `markUnsaved({ sections: sectionsMap })` |
| `// Wave 2: UnsavedIndicator inserted here` | Replaced with `<UnsavedIndicator saveState={saveState} />` |

No new stubs introduced in Wave 2.

---

## Threat Surface Scan

Mitigations from plan threat model applied:

| Threat ID | Applied |
|-----------|---------|
| T-12-05 | ✅ Pydantic `WorkspaceContentPatch` validates body; job existence checked before write |
| T-12-07 | ✅ FastAPI default 1MB body limit applies; Tiptap JSON for CV sections < 50KB |
| T-12-09 | ✅ `SuggestionTooltip` renders suggestion text as React children — React escapes by default |

No new threat surface introduced beyond what was in the threat model.

---

## Self-Check: PASSED

**Files created:**
- ✅ `frontend/components/workspace/canvas/editor-toolbar.tsx`
- ✅ `frontend/components/workspace/canvas/suggestion-tooltip.tsx`
- ✅ `frontend/hooks/use-draft-save.ts`

**Files modified:**
- ✅ `frontend/components/workspace/canvas/section-block.tsx`
- ✅ `frontend/components/workspace/canvas/canvas-editor.tsx`
- ✅ `frontend/lib/workspace.ts`
- ✅ `backend/app/schemas/workspace.py`
- ✅ `backend/app/api/v1/endpoints/workspace.py`

**Commits verified:**
- `c2f4b9e` — Task 1: EditorToolbar + SuggestionTooltip + SectionBlock Wave 2
- `123141f` — Task 2: backend PATCH endpoint + schema extensions + workspace.ts types
- `7b6e397` — Task 3: useDraftSave + UnsavedIndicator + CanvasEditor wiring

**TypeScript:** `npx tsc --noEmit` → exit 0 (clean)

**ESLint:** 2 max-len warnings in editor-toolbar.tsx (pre-existing rule, not blocking); no errors

**Backend ruff:** `ruff check app/schemas/workspace.py app/api/v1/endpoints/workspace.py` → all checks passed

**Backend schema import:** `from app.schemas.workspace import WorkspaceContentPatch, WorkspaceContentSaveResult; print('schemas OK')` → OK

**Backend full import:** `from app.main import app; print('OK')` → OK
