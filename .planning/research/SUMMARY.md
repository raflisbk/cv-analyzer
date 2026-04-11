# Research Summary: v4.0 PDF-First Analysis Workspace

**Project:** CV Analyzer (pathkr.ai) — v4.0 PDF-First Analysis Workspace
**Stack:** Next.js 15 App Router + FastAPI + PostgreSQL + Redis/Celery + Cloudflare R2
**Researched:** 2025
**Synthesized:** 2025
**Confidence:** HIGH (all key claims verified against live npm registry, PyPI, and codebase direct reads)

## TL;DR

- **`react-pdf v10.4.1`** is the only viable PDF renderer — it bundles pdfjs-dist v5.4.296 which is incompatible with `react-pdf-highlighter` (pins v4). **Do NOT use react-pdf-highlighter.**
- **Custom annotation overlay** via `customTextRenderer` + CSS `<mark>` is both simpler and more correct than any third-party annotation library for this use case.
- **`pycrdt-websocket`** mounts as an ASGI sub-app directly into FastAPI — no Node.js sidecar, no new Railway service. Phase 1 uses `y-indexeddb` only (zero backend cost); Phase 2 upgrades by swapping one provider.
- **`WorkspaceHydration.file` has no PDF URL** — the single biggest backend gap for Phase 13 is adding `GET /jobs/{id}/file` to stream the original PDF binary.
- **Phase 13 MUST use `/workspace-v2/[job_id]`** parallel route. The upload flow hardcodes `/workspace/` — touching that path in Phase 13 breaks the entire analysis pipeline.

---

## Executive Summary

v4.0 transforms the existing Tiptap-based canvas editor into a PDF-first, three-panel analysis workspace. The center panel replaces the Tiptap canvas with a live PDF viewer showing the user's original CV; the left panel embeds the existing analysis results components (all 14 are pure props-driven and drop-in embeddable); the right panel becomes a contextual AI chat. A sticky footer provides diff toggle (original ↔ AI-optimized PDF), apply-all, and export actions.

The recommended approach builds on the existing stack without adding new infrastructure services. `react-pdf v10` renders the PDF with its built-in text layer — enabling native browser text selection and stabilo-style highlights via `customTextRenderer` without any third-party annotation library. Zustand (new) manages the cross-panel `activeSuggestionId` state. `@floating-ui/react` (new) handles popover positioning for annotation hovers and text-selection popovers near viewport edges. The hover pattern reuses the existing `useRef + setTimeout` mechanic already present in `section-block.tsx` — not `useDebounce`, which fires on idle not on first hover.

The highest-risk architectural decision is the CRDT strategy. Phase 1 uses `y-indexeddb` with zero backend changes — annotations persist in the browser across sessions. Phase 2 upgrades to `pycrdt-websocket` as an ASGI sub-app mounted into FastAPI at `/yjs`, requiring only `pip install pycrdt pycrdt-websocket` and a `app.mount()` call. This avoids the alternative (a Node.js y-websocket sidecar or Hocuspocus service), which would add a second Railway service. The abandoned `ypy-websocket` must NOT be used — only `pycrdt-websocket` (actively maintained, Jupyter-backed).

---

## Final Stack Decisions

### Frontend

| Package | Version | Rationale |
|---------|---------|-----------|
| `react-pdf` | 10.4.1 | React 19 + Next.js 15 App Router compatible; bundles pdfjs-dist 5.4.296; `renderTextLayer` + `customTextRenderer` give text selection and stabilo highlights |
| `yjs` | 13.6.30 | CRDT foundation; 21k stars; 3.4M weekly downloads; Tiptap uses it internally |
| `y-indexeddb` | 9.0.12 | Phase 1 browser-local annotation persistence; zero infrastructure cost |
| `y-websocket` | 3.0.0 | Phase 2 only; swap in when multi-user is needed; same Y.Doc interface |
| `zustand` | ^5.x | Cross-panel active suggestion state; selector subscriptions prevent full re-renders |
| `@floating-ui/react` | ^0.26.x | Viewport-safe popover positioning; `flip()` + `shift()` prevent edge clipping |

**Do NOT install:**
- `react-pdf-highlighter` — pdfjs-dist v4/v5 conflict; incompatible with react-pdf v10
- `react-pdf-highlighter-extended` — same conflict (fork, same pdfjs pin)
- `ai` (Vercel AI SDK) — unnecessary; custom `fetch + ReadableStream` is consistent with existing SSE patterns
- `motion` / Framer Motion — not needed for this milestone; `tailwindcss-animate` already covers transitions
- `ypy-websocket` — abandoned; use `pycrdt-websocket` only

**Already installed and reusable:**
- `use-debounce` v10.1.1 — available but WRONG for hover delay (use `useRef + setTimeout`)
- `tailwindcss-animate` — diff toggle opacity fade (`animate-in fade-in`)
- `@radix-ui/*` primitives — available for UI but NOT for annotation popover timing control

### Backend

| Package | Rationale |
|---------|-----------|
| `pycrdt` v0.12.50 | Python bindings to `yrs` (Rust) — same underlying engine as Yjs; active on PyPI |
| `pycrdt-websocket` v0.16.0 | Yjs sync protocol in Python; ASGI-mountable into FastAPI via `app.mount("/yjs", ASGIServer(...))` |
| `WeasyPrint` | Already installed (v61.2 in requirements.txt); existing `export.py` pattern is the template |

**Do NOT add:**
- `@y/websocket-server` (Node.js) — adds a second Railway service; solved by pycrdt-websocket in-process
- `hocuspocus` — Node.js only; same problem
- Separate y-redis server — Redis already used for Celery/SSE; pycrdt-websocket's SQLiteYStore is sufficient for Phase 2

---

## Architecture Decisions

### PDF Rendering

**Decision:** `react-pdf v10` with `renderTextLayer={true}` + `customTextRenderer` + `dynamic(() => import(...), { ssr: false })`.

- Canvas layer renders the visual PDF; text layer renders transparent DOM spans enabling `window.getSelection()`
- `customTextRenderer` injects `<mark class="stabilo-yellow" data-suggestion-id="...">` HTML into matching text spans — stabilo highlights with zero coordinate math
- Worker must be configured in the same client component that renders `<Document>`:
  ```
  pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
  ```
- `next.config.js` must set `config.resolve.alias.canvas = false` or builds fail
- Annotation coordinates stored as **percentage of page dimensions** (not pixel values) — zoom-independent

### Annotation System

**Decision:** Event delegation on annotation overlay container + `useRef + setTimeout` for 1.5s delayed hover open.

- PDF renders two DOM layers: canvas (visual) + text layer (selection spans)
- Custom annotation highlight divs sit in a third absolute-positioned overlay layer with `pointer-events: none`
- On annotation hover: `openTimerRef.current = setTimeout(() => setPopover(payload), 1500)` — cancel on mouseout before fire
- NOT `useDebounce` — debounce fires after idle (re-entering annotation resets timer); delayed open fires after first hover regardless of re-entries
- Popovers use `@floating-ui/react` with `flip()` + `shift()` — replaces manual `getBoundingClientRect()` math
- Text selection: `selectionchange` event (not `mouseup`) — catches keyboard selection; fire "Edit with AI" popover at `range.getBoundingClientRect()`

### CRDT / Real-time

**Phase 1 (v4.0 MVP) — zero backend cost:**
```
Browser: Y.Doc ←→ y-indexeddb (IndexedDB in browser)
```
Annotations persist across page refresh. No WebSocket server. No backend changes.

**Phase 2 (future multi-user):**
```
Browser: Y.Doc ←→ y-websocket provider ←→ FastAPI /yjs (pycrdt-websocket ASGIServer)
                                                    ↓
                                             SQLiteYStore or PostgreSQL
```
Frontend upgrade: swap `IndexeddbPersistence` for `WebsocketProvider` (same Y.Doc interface).
Backend upgrade: `pip install pycrdt pycrdt-websocket` + `app.mount("/yjs", yjs_asgi)`.
**No new Railway service needed.**

### Structured CV Mirror

Three new columns on the `Job` model (one Alembic migration):

```python
cv_document     = Column(JSONB, nullable=True)       # CVDocument — structured parsed CV
suggestion_anchors = Column(JSONB, nullable=True)    # list[SuggestionAnchor] — AI suggestion locations
yjs_snapshot    = Column(LargeBinary, nullable=True)  # Y.Doc state bytes for crash recovery
```

`CVDocument` schema: `CVDocument → list[CVSection] → list[CVBlock] → list[CVField]`. Field IDs are stable UUIDs — the anchor points for suggestions even as text changes. Built by a new `build_cv_document_task` Celery task that runs after `llm_suggest` completes.

### Export Pipeline

**Decision:** Reuse existing WeasyPrint pattern from `export.py`.

```
Yjs Y.Doc → CVDocument (pycrdt Y.Map traversal) → Jinja2 `cv_optimized.html` → WeasyPrint → StreamingResponse
```

New endpoint `GET /jobs/{job_id}/export/cv-pdf` follows the identical pattern as existing `GET /jobs/{job_id}/export/pdf`. WeasyPrint CPU already offloaded via `loop.run_in_executor(None, ...)` in existing code — same pattern applies.

---

## Migration Path

### What's Preserved (Zero Touch)

| File / Endpoint | Reason |
|----------------|--------|
| `backend/app/api/v1/endpoints/compare.py` | Job match flow; `comparison_result` on Job model |
| `backend/app/api/v1/endpoints/workspace.py` | Hydration + draft save — used by BOTH v3 and v4 workspace |
| `backend/app/api/v1/endpoints/upload.py` | Creates Job record; sets job_id for all routing |
| `backend/app/api/v1/endpoints/results.py` | Results page data |
| `backend/app/api/v1/endpoints/stream.py` | SSE for job progress |
| `frontend/hooks/use-workspace-hydration.ts` | React Query key `["workspace-hydration", jobId]` |
| `frontend/hooks/use-draft-save.ts` | PATCH endpoint still valid; extend payload shape later |
| `frontend/lib/types.ts` | All shared interfaces (`ScoreResult`, `SuggestionItem`, etc.) |
| `frontend/lib/workspace.ts` | `WorkspaceHydration`, `WorkspaceFileInfo`, etc. |
| `frontend/components/workspace/workspace-hydration.tsx` | Loading/error/preparing states — reuse as-is |

### What's Replaced

| Component | Strategy |
|-----------|---------|
| `canvas-editor.tsx` | Replace — becomes `PdfWorkspaceEditor` (or similar orchestrator) |
| `canvas-split-panel.tsx` | Replace — 55/45 split becomes 3-panel grid (`[290px_1fr_340px]`) |
| `cv-preview.tsx` | Delete — Tiptap `generateHTML` preview is obsolete when PDF viewer is canonical |
| `editor-toolbar.tsx` | Delete — text formatting toolbar irrelevant in PDF-first view |
| `workspace-shell.tsx` | Replace — new shell in `workspace-v2/`; never modify v1 shell |

### What's Reused

**Extract to `lib/workspace-utils.ts` BEFORE deleting `canvas/`:**

| Utility | Source | Why |
|---------|--------|-----|
| `plainTextToTiptapDoc(text)` | `section-block.tsx:38-47` | Pure utility; tests already pass |
| `buildInitialSections(sections, draftContent)` | `canvas-editor.tsx:38-54` | Section dedup + merge logic |
| `normalizeSuggestion(raw)` | `canvas-editor.tsx:24-36` | snake_case → camelCase for API items |

**Embed from `results/` into Left Detail Panel (zero modification required):**

All 14 results components are pure props-driven — drop-in embeddable:

| Component | Props Required |
|-----------|---------------|
| `ScoreDashboard` | `scores: ScoreResult` |
| `AtsChecklist` | `checks: AtsCheck[]` |
| `SuggestionCards` | `cards: SuggestionCard[] \| null`, `isLoading: boolean` |
| `GrammarIssuesList` | `issues: GrammarIssue[]` |
| `CompareTab` | `jobId`, `jobRoles`, `comparisonResult`, `comparisonStatus`, `onCompareComplete` |
| `MatchScoreCard` + `SkillsGapDisplay` | `result: ComparisonResult` |

**Reuse interaction pattern:**
- `SuggestionTooltip` portal + accept/dismiss pattern → move to `components/workspace/suggestion-overlay.tsx`
- `SSEConnection` class → extend for chat (but use `fetch + ReadableStream` for POST chat streaming, not `EventSource`)

### Phase 13 Safety Net

**Use `/workspace-v2/[job_id]` parallel route.** Never touch `/workspace/[job_id]` until Phase 16.

```
Phase 13–15:  frontend/app/workspace-v2/[job_id]/page.tsx   ← new workspace
              frontend/components/workspace-v2/              ← new components
              frontend/components/workspace/                 ← UNTOUCHED

Phase 16:     Update job-routes.ts getWorkspaceRoute() → /workspace-v2/{id}
              Update workspace.py WorkspaceNavigation.workspace_url
              Add redirect: /workspace/[id] → /workspace-v2/[id]
              Delete canvas/ directory
```

**Why:** `frontend/lib/job-routes.ts` and `workspace.py` both return `/workspace/{job_id}`. The upload flow hardcodes this path — changing it in Phase 13 requires a coordinated backend + frontend change under time pressure. Building in a parallel route eliminates that risk entirely.

---

## Critical Pitfalls & Mitigations

| Pitfall | Severity | Phase | Mitigation |
|---------|----------|-------|-----------|
| `react-pdf-highlighter` pdfjs v4/v5 conflict | CRITICAL | 13 | Do not install. Use `customTextRenderer` for all annotations. |
| `WorkspaceHydration.file` has no PDF URL | HIGH | 13 | Add `GET /jobs/{id}/file` endpoint to stream original PDF binary before any PDF rendering work begins |
| Missing `ssr: false` on react-pdf import | HIGH | 13 | All PDF components must be wrapped: `dynamic(() => import('./pdf-viewer-inner'), { ssr: false })` |
| PDF.js Worker not configured → blank/silent render | HIGH | 13 | Set `GlobalWorkerOptions.workerSrc` + `config.resolve.alias.canvas = false` in `next.config.js` on day 1 |
| `min-height` on grid parent clips PDF scroll | HIGH | 13 | Use `height: calc(100vh - Xpx)` (not `min-height`) so `overflow-y-auto` on columns is effective |
| Touching `/workspace/[job_id]` in Phase 13 | HIGH | 13 | Use `/workspace-v2/[job_id]` parallel route; redirect only at Phase 16 |
| Deleting `canvas/` before extracting utilities | MEDIUM | 13 | Extract `plainTextToTiptapDoc`, `buildInitialSections`, `normalizeSuggestion` to `lib/workspace-utils.ts` first |
| PDF canvas overflow in 290px column | MEDIUM | 13 | Use `ResizeObserver` + `<Page width={containerWidth} />` prop |
| Tailwind preflight breaks PDF.js text layer | MEDIUM | 13 | Scope PDF resets inside `.pdf-text-layer-wrapper { all: initial }` or use `renderTextLayer={false}` for MVP |
| CORS on PDF fetch from R2 presigned URL | MEDIUM | 13 | Proxy PDF through Next.js `/api/v1/jobs/{id}/file` rewrite; do NOT use direct presigned URL redirect |
| `useDebounce` for hover delay | MEDIUM | 14 | Use `useRef + setTimeout`; debounce fires on idle (resets on re-entry), not on first hover |
| `EventSource` for chat streaming | MEDIUM | 14 | Use `fetch + ReadableStream`; EventSource is GET-only, chat needs POST with body |
| React Strict Mode double-mounting Yjs provider | MEDIUM | 15+ | `initialized.current` ref guard in `useEffect` |
| `y-indexeddb` crash during SSR | MEDIUM | 15+ | Dynamic import inside `useEffect` with `typeof window !== 'undefined'` guard |
| `ypy-websocket` vs `pycrdt-websocket` confusion | HIGH | 15+ | Use ONLY `pycrdt-websocket`; `ypy-websocket` is abandoned |
| Annotation coordinate mapping | HIGH | 14 | **Spike required** — PDF coordinate space (bottom-left origin) vs DOM (top-left); store as percentage of page dimensions for zoom-independence |

---

## Open Questions for Phase Research

1. **`GET /jobs/{id}/file` endpoint design** — should it stream the R2 binary directly (adding R2 SDK dependency to endpoint) or return a presigned URL + handle the CORS chain? Decide before Phase 13 starts.

2. **`pycrdt-websocket` FastAPI mount stability** — verify `app.mount("/yjs", ASGIServer(...))` handles WebSocket upgrade headers correctly through Starlette's router. May need `@app.websocket("/yjs/{room}")` with manual adapter instead of `mount()`.

3. **Annotation coordinate storage schema** — `customTextRenderer` approach stores highlights by text item index (fragile if PDF changes) vs text content string matching (more resilient). Define schema before Phase 14 annotation persistence.

4. **`build_cv_document_task` NLP mapping accuracy** — the existing `nlp_result.sections` format uses free-text extraction. The CVDocument requires structured `CVField` extraction per block. The mapping fidelity (especially for experience date ranges and bullet points) needs a spike against real resume samples.

5. **Optimized PDF generation pipeline** — how does the backend produce the "optimized" version? The diff toggle needs TWO distinct PDFs. If the optimized PDF is generated from Yjs/CVDocument state via WeasyPrint, Phase 14 must produce it before the diff toggle can work end-to-end.

6. **Mobile layout** — 3-panel → tabbed collapse is needed below `lg` breakpoint. Deferred to Phase 15+. Use `hidden lg:block` stub in Phase 13 with no mobile tab navigation.

---

## Recommended Phase Order

| Phase | Scope | Rationale |
|-------|-------|-----------|
| **Phase 13** | 3-panel shell + PDF viewer (static, read-only) | Foundation for everything; get PDF rendering + worker config + CORS chain working first. `workspace-v2/` parallel route. No annotation logic yet. |
| **Phase 14** | DB migration + CVDocument build + suggestion anchors | Backend infra (3 new columns + Celery task + anchor builder). Unblocks all annotation and export work. |
| **Phase 15** | Annotation overlay + hover UX + panel sync | `customTextRenderer` stabilo highlights, `useDelayedHover` hook, Zustand `activeSuggestionId`, bidirectional suggestion ↔ PDF sync. |
| **Phase 16** | Diff toggle + sticky footer + export CV-PDF | Zustand `diffMode`, CSS opacity layers, WeasyPrint export endpoint, footer actions. Route cutover from `/workspace/` → `/workspace-v2/`. |
| **Phase 17** | Contextual AI chat panel | `fetch + ReadableStream` POST streaming, context injection from workspace store, text selection → "Ask about this" flow. |
| **Phase 18** | Yjs CRDT + y-indexeddb persistence | Phase 1 CRDT (browser-local). Annotation state moves from React state → Y.Doc + IndexedDB. Survives page refresh. |
| **Phase 19** *(optional)* | pycrdt-websocket Phase 2 upgrade | Backend WebSocket room + snapshot strategy. Only needed if multi-user collaboration becomes a requirement. |

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| react-pdf v10 capabilities | HIGH | Live npm registry + README verified; `customTextRenderer` and `renderTextLayer` props documented with examples |
| pdfjs v4/v5 conflict | HIGH | Live npm packages confirmed: react-pdf@10.4.1 pins pdfjs 5.4.296; react-pdf-highlighter pins 4.x |
| Yjs ecosystem health | HIGH | 3.4M weekly downloads; 21k stars; y-websocket v3 aligns with Yjs v13 |
| y-indexeddb Phase 1 | HIGH | Zero backend infrastructure; well-documented offline-first pattern |
| pycrdt-websocket ASGI mount | MEDIUM | README + PyPI verified; only 46 stars — less battle-tested; needs spike to confirm FastAPI mount works |
| Annotation coordinate mapping | MEDIUM | pdfjs `getTextContent()` API is documented but the PDF-space → DOM-space transform is non-trivial; spike required |
| CVDocument NLP mapping | MEDIUM | Mapping logic depends on `nlp_result` format quality from existing pipeline; needs validation against real CVs |
| WeasyPrint CV export | HIGH | Already installed and working in `export.py`; same pattern applies |
| Phase 13 parallel route safety | HIGH | Directly observed: `job-routes.ts` hardcodes `/workspace/`; parallel route approach is proven pattern |

**Overall Confidence: HIGH** for stack decisions, MEDIUM for backend CRDT integration and annotation coordinate system.

---

## Sources

- `stack-research.md` — live npm registry (react-pdf@10.4.1, yjs@13.6.30, y-websocket@3.0.0), PyPI (pycrdt@0.12.50, pycrdt-websocket@0.16.0), react-pdf README, pdfjs-dist README
- `features-research.md` — direct codebase read of `section-block.tsx`, `suggestion-tooltip.tsx`, `lib/sse.ts`, `package.json`; pattern extraction from existing hover/popover implementations
- `architecture-research.md` — direct codebase read of `backend/app/models/`, `backend/app/api/v1/endpoints/`, `backend/requirements.txt`; CVDocument schema designed from NLP output structure
- `pitfalls-research.md` — direct codebase read of `frontend/lib/job-routes.ts`, `workspace.py` navigation schema, `canvas/` component tree, `WorkspaceHydration` TypeScript interface

---

*Research synthesized: 2025*
*Milestone: v4.0 PDF-First Analysis Workspace*
*Ready for roadmap: yes*

