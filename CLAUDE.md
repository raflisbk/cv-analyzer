# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Mandatory Rules

1. **Backend Rule #1: Always activate Conda first**
    - Run `conda activate sbk-cv-analyzer` before any backend operation.
    - This includes server start, migrations, Celery workers, tests, linting, formatting, and package installation.

2. **Git commits must not include AI tool trailers** — no `Co-authored-by:`, `Generated with`, `Assisted-by:`, or similar. See the Git Commit Rules section below.

3. **Never take shortcuts to fix bugs — always fix robustly**
    - Do not remove code, mixins, or features just to make an error disappear.
    - If a model has a mixin that expects DB columns, create an Alembic migration — do not strip the mixin.
    - If a library version conflicts, pin it properly in `pyproject.toml` — do not just `pip install` without recording it.
    - If a schema diverges from the DB, the fix is always a migration — never a model downgrade.
    - Ask: "Does this fix address the root cause, or just hide the symptom?"

## Project

**CV Analyzer** — Portfolio project demonstrating AI Engineering mastery through a production-ready CV/resume analyzer with multi-dimensional scoring, LLM-powered suggestions, job role comparison, and an agentic CV workspace editor.

**Data Flow:** Upload → R2 storage → `process_document_task` → `nlp_analysis_task` → `scoring_task` → `grammar_check_task` → `llm_suggest_task` (writes `cv_document`, sets COMPLETE, indexes Job Memory) → SSE streaming → Results / Workspace

## Architecture

**Monorepo:**
- `backend/` — FastAPI + Python 3.13.9
- `frontend/` — Next.js 15 + React 19 + TypeScript
- `.planning/` — GSD workflow artifacts (gitignored, local only)

**Tech Stack:**
- Backend: FastAPI + PostgreSQL (pgvector) + Redis/Celery + Cloudflare R2
- Frontend: Next.js 15 + shadcn/ui + Tailwind CSS + Tiptap v3
- AI: KoboiLLM (OpenAI-compatible API) for LLM + embeddings; spaCy for NLP
- Deploy: Vercel (frontend) + Railway (backend)

**Key Architecture Patterns:**
- Celery task chain (5 stages) with `ProgressTask` base class publishing progress to Redis pub/sub (`job:updates:{job_id}`)
- Server-Sent Events (SSE) at `/api/v1/stream/{job_id}` reads Redis pub/sub for real-time progress
- RAG with `pgvector` — `KnowledgeChunk` model stores text + `Vector(3072)` embeddings
- **Job Memory System** — `job_memory_chunks` table stores per-job activity (cv_section, analysis, edit, chat) as `Vector(3072)` embeddings. Indexed post-analysis; queried by inline edit and chat for contextual LLM calls. ⚠️ As of 2026-07-03 the implementation files (`models/job_memory_chunk.py`, `services/memory/indexer.py`, `services/memory/retriever.py`, the `job_memory_chunks` migration) are missing from the working tree and unrecoverable from local git history — the table/API surface described here is the intended design, not a verified-present implementation. Verify these files exist before relying on this system.
- Scoring is **fully LLM-based** (`services/scoring/llm_scorer.py`), not anchor/embedding similarity — `anchors.py`/`embeddings.py`/`dynamic_anchors.py`/`role_anchors.py`/`hf_embeddings.py` in the same directory are dead code for scoring (only `embeddings.py::get_embedding` is still used, by `rag/`, unrelated to scoring). Current `SCORING_VERSION = "v5"`, weights impact 35% / clarity 30% / relevance 20% / completeness 15%. Ensemble: N runs (`CV_ANALYZER_SCORING_ENSEMBLE_RUNS`) per CV, median taken per dimension. Redis-cached by `llm_score:{SCORING_VERSION}:{hash}`. Overlaid with `deterministic_metrics.py` (rule-based ±10pt adjustment: quantified bullets, action verbs, passive voice, section coverage, gaps) and archetype-aware impact guidance (`llm/archetype_detector.py`, 2-tier: domain then archetype within domain, 2 LLM calls).
- Grammar check is LLM-based (KoboiLLM), not LanguageTool
- Workspace editor: Tiptap v3 + Y.js (pycrdt-websocket on backend, y-websocket on frontend) for collaborative editing
- **Chat is still mocked** — `POST /api/v1/jobs/{id}/chat` calls `_stream_mock_response()` in `chat.py`, not a real KoboiLLM call, despite the system prompt/job-memory scaffolding being real. Don't assume chat responses reflect actual CV content.

## Essential Commands

### Backend (Python/FastAPI)

**CRITICAL: Always activate Conda environment first:**
```bash
conda activate sbk-cv-analyzer
```

**Development server:**
```bash
cd backend
python run.py          # Windows: MUST use run.py (sets WindowsSelectorEventLoopPolicy before uvicorn)
# uvicorn app.main:app --reload --port 8000  ← DO NOT use directly on Windows (ProactorEventLoop breaks psycopg)
# API: http://localhost:8000
# Docs: http://localhost:8000/docs
```

**Database migrations:**
```bash
cd backend
alembic upgrade head                          # Apply migrations
alembic revision --autogenerate -m "msg"      # Create migration
alembic downgrade -1                          # Rollback one migration
alembic current                               # Check current version
```

**Celery worker (background tasks):**
```bash
cd backend
celery -A app.tasks.celery_app worker --loglevel=info --pool=solo
```

**Testing:**
```bash
cd backend
pytest                                         # Run all tests
pytest tests/test_scorer.py                   # Run specific test file
pytest tests/test_scorer.py::test_score_cv    # Run specific test
pytest -v --cov=app                           # Verbose with coverage
```

**Code quality:**
```bash
cd backend
black .                   # Format code
ruff check .              # Lint code
ruff check --fix .        # Auto-fix issues
python -c "from app.main import app; print('OK')"  # Verify import
```

**Install dependencies:**
```bash
# Source of truth is backend/pyproject.toml — do NOT use requirements.txt
pip install -e backend   # From project root
```

### Frontend (Next.js/React)

```bash
cd frontend
npm run dev              # http://localhost:3000
npm run build            # Production build
npm run test             # Vitest (run all)
npm run test:watch       # Watch mode
npm run lint             # ESLint
npx tsc --noEmit         # Type check
npx prettier --write .   # Format
```

## API Endpoints (v1)

Base path: `/api/v1/` — proxied by Next.js (`/api/v1/:path*` → `http://127.0.0.1:8000/api/v1/:path*`).  
Y.js WebSocket is mounted at root `/yjs/{job_id}` (NOT under `/api/v1/`).

### Auth (`auth.py` — prefix `/auth`)

| Method | Path | Paradigm | Notes |
|--------|------|----------|-------|
| `POST` | `/api/v1/auth/google` | REST | Google access token → verify → upsert user → JWT cookie |
| `GET`  | `/api/v1/auth/me` | REST | Read JWT from cookie → return user profile |
| `POST` | `/api/v1/auth/logout` | REST | Clear JWT cookie |

### Upload (`upload.py`)

| Method | Path | Paradigm | Notes |
|--------|------|----------|-------|
| `POST` | `/api/v1/upload` | REST + multipart/form-data | Fields: `file`, `jd_text?`, `target_role?`, `parent_job_id?`. Triggers Celery 5-stage chain. Returns `job_id`. |

### Jobs (`jobs.py`)

| Method | Path | Paradigm | Notes |
|--------|------|----------|-------|
| `GET` | `/api/v1/jobs/{job_id}` | REST | Job status + metadata. No separate `/status` sub-route. |
| `GET` | `/api/v1/jobs/{job_id}/file/proxy` | REST → binary stream | Proxies PDF from R2 to browser. `Content-Type: application/pdf`. Avoids CORS from direct R2 URL. |

### Stream (`stream.py`)

| Method | Path | Paradigm | Notes |
|--------|------|----------|-------|
| `GET` | `/api/v1/stream/{job_id}` | **SSE** | `text/event-stream`. Subscribes to Redis pub/sub `job:updates:{job_id}`. Emits progress JSON until `stage=complete\|failed`. |

### Results (`results.py`)

| Method | Path | Paradigm | Notes |
|--------|------|----------|-------|
| `GET` | `/api/v1/jobs/{job_id}/results` | REST | Full analysis results: scores, sections, skills, grammar, ATS, suggestions, comparison, version history. |

### Workspace (`workspace.py`)

| Method | Path | Paradigm | Notes |
|--------|------|----------|-------|
| `GET`   | `/api/v1/jobs/{job_id}/workspace` | REST | Hydration payload: file info, document (source_text + sections), analysis context, suggestion anchors. |
| `GET`   | `/api/v1/jobs/{job_id}/file` | REST | Returns R2 presigned URL (3600s expiry). |
| `GET`   | `/api/v1/jobs/{job_id}/html` | REST | Converts CV to HTML for Tiptap editor via `PDFToHTMLConverter`. |
| `PATCH` | `/api/v1/jobs/{job_id}/workspace/content` | REST | Save Tiptap draft to `job.workspace_draft`. Body: `{sections}`. |
| `POST`  | `/api/v1/ai/improve` | REST | Legacy inline edit — no job context, no auth. Used by `InlineAIPopup` in `rich-text-editor.tsx`. |
| `POST`  | `/api/v1/export/pdf` | REST → binary PDF | Takes `{html, filename}` from body (Tiptap HTML). WeasyPrint → returns PDF bytes. |

### Inline Edit (`inline_edit.py`)

| Method | Path | Paradigm | Notes |
|--------|------|----------|-------|
| `POST` | `/api/v1/jobs/{job_id}/inline-edit` | REST | AI rewrite with full cv_text + job memory context + scores. Body: `{selectedText, prompt, cvContext?}`. Max 1000 chars. Indexes each edit to job memory. |

### Export (`export.py`)

| Method | Path | Paradigm | Notes |
|--------|------|----------|-------|
| `POST` | `/api/v1/jobs/{job_id}/export/optimized` | REST → binary PDF | Renders `cv_document` via Jinja2 template → WeasyPrint. Returns PDF attachment. |
| `GET`  | `/api/v1/jobs/{job_id}/export/pdf` | REST → binary PDF | Renders full analysis report (scores, suggestions, grammar, ATS) → WeasyPrint. Returns PDF attachment. |

### Comparison (`compare.py`)

| Method | Path | Paradigm | Notes |
|--------|------|----------|-------|
| `GET`  | `/api/v1/job-roles` | REST | List available job roles for JD comparison. |
| `POST` | `/api/v1/jobs/{job_id}/compare` | REST + fire-and-forget | Triggers `compare_cv_task.delay()`. Returns immediately with `comparison_status: "pending"`. Result readable via `/results`. |

### Chat (`chat.py`)

| Method | Path | Paradigm | Notes |
|--------|------|----------|-------|
| `POST` | `/api/v1/jobs/{job_id}/chat` | **SSE** | `text/event-stream`. Retrieves job memory → builds system prompt → **streams a hardcoded mock response**, not a real `KoboiLLMService.chat_stream()` call (see Non-Obvious Patterns). Emits `{token}` events then `{type: "complete"}`. Indexes both turns to job memory. |

### Y.js WebSocket (mounted at root, not `/api/v1/`)

| Protocol | Path | Paradigm | Notes |
|----------|------|----------|-------|
| `WS` | `/yjs/{job_id}` | **WebSocket** | pycrdt-websocket `ASGIServer`. Handles Y.js CRDT sync for suggestion status map (`suggestion_statuses`) + inline edits map (`inline_edits`). Validates job_id on connect. |

### Health

| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/health` | Returns `{status, timestamp, version}`. Not under `/api/v1/`. |

---

### API Paradigm Summary

| Paradigm | Used for | Implementation |
|----------|----------|----------------|
| **REST** | All CRUD + trigger actions | FastAPI `@router.get/post/patch` |
| **REST + multipart** | CV upload | FastAPI `UploadFile` + `Form` fields |
| **REST → binary stream** | File proxy, PDF exports | FastAPI `StreamingResponse` |
| **SSE** | Progress pipeline (`stream.py`), AI chat (`chat.py`) | FastAPI `StreamingResponse(media_type="text/event-stream")` backed by Redis pub/sub |
| **WebSocket** | Y.js CRDT state sync | `pycrdt-websocket` `ASGIServer` mounted at `/yjs/` |

## Service Architecture

**`backend/app/services/`:**
- `parser.py` — Document text extraction (PyMuPDF + python-docx) with OCR fallback
- `storage.py` — Cloudflare R2 via boto3 (presigned URLs, sync methods)
- `ocr.py` — OCR fallback for scanned PDFs
- `nlp/` — spaCy-based skill extractor, section detector, entity extractor
- `scoring/scorer.py` — Orchestrator: calls `llm_scorer.score_cv_with_llm()`, applies `deterministic_metrics.py` adjustments, computes JD keyword gaps (`jd_gap.py`)
- `scoring/llm_scorer.py` — The real scorer. `SCORING_VERSION`, `_WEIGHTS`, ensemble median-of-N, Redis cache, archetype-aware impact guidance
- `scoring/deterministic_metrics.py` — Rule-based overlay (quantified bullets, action verbs, passive voice, section coverage, employment gaps); nudges the LLM score ±10pts
- `scoring/anchors.py`, `dynamic_anchors.py`, `role_anchors.py`, `embeddings.py`, `hf_embeddings.py` — **dead code for scoring** (pre-v3 anchor/embedding approach); only `embeddings.py::get_embedding` is still used, by `rag/`, unrelated to scoring
- `grammar/checker.py` — LLM-based grammar/spelling checker (NOT LanguageTool)
- `ats/checker.py` — ATS compatibility checker
- `memory/indexer.py` — Job Memory indexer: `index_cv_sections`, `index_analysis_summary`, `index_edit`, `index_chat_message`. ⚠️ File is currently missing from the working tree — see Architecture section
- `memory/retriever.py` — `retrieve_job_memory(job_id, query, limit, content_types?)` — cosine similarity over `job_memory_chunks`. ⚠️ File is currently missing from the working tree — see Architecture section
- `rag/embeddings.py` — RAG embedding calls
- `rag/retriever.py` — Retrieves top-K chunks from pgvector (`knowledge_chunks`)
- `rag/chunker.py` — Chunks knowledge base text for ingestion
- `anchor_service.py` — `compute_suggestion_anchors()` for workspace highlight anchors
- `llm/koboi_llm_service.py` — Primary LLM service; `_chat()` (sync), `chat_stream()` (sync streaming generator), `generate_suggestions()`
- `llm/protocol.py` — `LLMService` Protocol + `SuggestionsOutput` Pydantic schema
- `llm/score_explainer.py` — Explains scores in natural language
- `llm/inline_edit_service.py` — Rewrites CV text; accepts `cv_text` (full) + `memory_chunks` for context
- `llm/chat_context_builder.py` — Builds chat system prompt from job scores + cv_document + `memory_chunks` (feeds a mock chat endpoint today — see Non-Obvious Patterns)
- `llm/archetype_detector.py` — 2-tier LLM archetype detection: domain first (31 choices), then archetype within domain (up to ~79 choices)
- `llm/hf_llm_service.py` — Hugging Face Inference API client. **Dead code** — zero call sites in the app; do not assume it's the fallback path
- `llm/metrics.py` — LLM token usage counter (Prometheus)

**Celery Tasks (`backend/app/tasks/`):**
- `document_processing.py` — `process_document_task`; defines `ProgressTask` base class
- `nlp_analysis.py` — `nlp_analysis_task`
- `scoring.py` — `scoring_task`
- `grammar_check.py` — `grammar_check_task`
- `llm_suggest.py` — `llm_suggest_task` — **final task**; writes `job.cv_document` + sets `COMPLETE` + indexes Job Memory (cv_sections + analysis_summary, best-effort)
- `comparison.py` — `compare_cv_task` — independent task for JD comparison
- `cleanup.py` — Periodic cleanup of expired jobs/files

## Environment Variables

All variables prefixed with `CV_ANALYZER_`. Key ones:

```bash
# Database
CV_ANALYZER_DB_HOST=localhost
CV_ANALYZER_DB_NAME=cv_analyzer
CV_ANALYZER_DB_USER=postgres
CV_ANALYZER_DB_PASSWORD=

# Redis
CV_ANALYZER_REDIS_URL=redis://localhost:6379/0

# KoboiLLM (primary AI provider — OpenAI-compatible API)
CV_ANALYZER_KOBOI_API_KEY=
CV_ANALYZER_KOBOI_BASE_URL=https://lite.koboillm.com/v1
CV_ANALYZER_LLM_MODEL=openai/gpt-5.1
CV_ANALYZER_EMBEDDING_MODEL=openai/text-embedding-3-large
CV_ANALYZER_EMBEDDING_DIMENSIONS=3072

# RAG / Scoring
CV_ANALYZER_RAG_TOP_K=5
CV_ANALYZER_LLM_CACHE_TTL=86400

# Storage
CV_ANALYZER_R2_ENDPOINT=
CV_ANALYZER_R2_ACCESS_KEY=
CV_ANALYZER_R2_SECRET_KEY=
CV_ANALYZER_R2_BUCKET=cv-uploads
```

Copy `backend/.env.example` → `backend/.env`. Settings are loaded via `pydantic-settings` (case-sensitive, `lru_cache`).

## Frontend Routes

- `/` — Landing page / homepage
- `/workspace-v2/new` — Upload entry point (redirects to workspace on completion)
- `/workspace-v2/[job_id]` — Agentic CV workspace (Tiptap editor + PDF viewer + chat)
- `/results/[job_id]` — Analysis results (scoring, suggestions, comparison tabs)

## Non-Obvious Patterns

**Celery `ProgressTask` base class** — All analysis tasks extend `ProgressTask` from `document_processing.py`. Call `self.update_progress(job_id, stage, percentage, message)` to publish JSON to `job:progress:{job_id}` (Redis key + pub/sub channel `job:updates:{job_id}`).

**`job.cv_document`** — Written atomically in `llm_suggest_task` in the same DB transaction that sets `COMPLETE`. Contains `{sections, metadata, suggestions, scores}`. The workspace hydrates from this field.

**`job.scores` type safety** — In the chat context builder, `job.scores` (JSONB dict) is wrapped as `ScoreResult(**job.scores)` for type-safe attribute access.

**Tiptap `immediatelyRender: false`** — Required on ALL `useEditor()` calls to prevent Next.js 15 SSR hydration mismatch with ProseMirror.

**`SuggestionTooltip` uses portal** — ProseMirror marks are raw DOM nodes, not React components. Radix `TooltipTrigger asChild` cannot wrap them. Use portal rendering to `document.body` + event delegation via `mouseover` on `[data-suggestion-id]`.

**Y.js WebSocket scoping** — `y-websocket@3.0.0` `WebsocketProvider` connects to `ws://{API_HOST}/yjs/{job_id}`. Backend uses `pycrdt-websocket` (`ASGIServer` mounted as sub-app). Room scoping is by URL path — no manual room management needed.

**RAG hnsw index** — `alembic --autogenerate` does NOT detect the hnsw vector index on `knowledge_chunks.embedding`. Add it manually in the migration file; never let autogenerate remove it.

**Suggestion key normalization** — Normalize suggestion keys at the results boundary before rendering (map `original_text`/`after_text` from LLM output).

**`_repair_llm_output()` in `llm_suggest.py`** — Post-processes raw LLM JSON to fill missing `type` fields before Pydantic validation.

**`use-job-results` uses SSE, not polling** — `hooks/use-job-results.ts` connects to `GET /stream/{job_id}` (SSE) and calls `queryClient.invalidateQueries` on `stage=complete|failed` to trigger a single React Query refetch. No `refetchInterval`. If SSE errors, falls back to one `invalidateQueries` call. `use-workspace-hydration.ts` still uses `refetchInterval: 3000ms` (acceptable — only active before workspace is ready, stops immediately after).

**Two inline-edit endpoints exist** — `POST /api/v1/jobs/{id}/inline-edit` (in `inline_edit.py`, has job context + full cv_text + job memory, used by `InlineEditPopover` in PDF viewer) and `POST /api/v1/ai/improve` (in `workspace.py`, legacy, no job context, used by `InlineAIPopup` in `rich-text-editor.tsx`). The PDF-viewer path is the primary workspace flow.

**Chat is still a mock** — `POST /api/v1/jobs/{id}/chat` (`chat.py`) calls `_stream_mock_response()`, a hardcoded string streamed character-by-character via `asyncio.sleep(0.02)`. `KoboiLLMService.chat_stream()` exists and is wired for scoring/grammar/etc., but chat does not call it yet. The system prompt and job-memory retrieval scaffolding around it are real — only the final LLM call is a placeholder.

**Job Memory System** — `job_memory_chunks` table (4 `content_type`: `cv_section`, `analysis`, `edit`, `chat`). Indexed automatically after `llm_suggest_task` completes. Queried via `retrieve_job_memory(job_id, query)` in inline edit + chat. The HNSW index uses `halfvec` cast — do NOT use `vector_cosine_ops` for >2000 dims. See the ⚠️ note under Architecture — the implementation files for this system are currently missing from the working tree.

**HNSW index for >2000 dims** — pgvector HNSW rejects `vector_cosine_ops` if column dimension > 2000. Use halfvec cast: `USING hnsw ((embedding::halfvec(3072)) halfvec_cosine_ops)`. Both `knowledge_chunks` and `job_memory_chunks` use this pattern.

## Key Design Decisions

1. **KoboiLLM over Claude/OpenAI directly** — OpenAI-compatible API; both LLM completions and embeddings go through the same base URL + key
2. **LLM-based scoring (v5), not embedding similarity** — `llm_scorer.py` prompts the LLM directly for all 4 dimensions per call; no anchor phrases. Ensemble of N runs (median) reduces LLM non-determinism; a deterministic rule-based overlay (`deterministic_metrics.py`) nudges the LLM score ±10pts; archetype detection (2-tier LLM call, 31 domains) tailors impact-dimension guidance per role. Bump `SCORING_VERSION` whenever the prompt/weights change — it's baked into the Redis cache key so old scores never leak into new results.
3. **Celery `--pool=solo`** — Required on Windows; prefork uses spawn which crashes
4. **`asyncio.WindowsSelectorEventLoopPolicy`** — psycopg requires SelectorEventLoop; set in `celery_app.py`
5. **`pyproject.toml` as dependency source** — `requirements.txt` is for tooling compat only; always install via `pip install -e backend`
6. **No `alembic autogenerate` for vector indexes** — Must add hnsw index manually in migrations. Always use `halfvec` cast for >2000 dims.
7. **Grammar via LLM** — KoboiLLM replaces LanguageTool for grammar/spelling; prompts return structured JSON
8. **Job Memory per-job, not per-user** — `job_memory_chunks` is scoped to `job_id` (cascades on job delete). Global user knowledge lives in `knowledge_chunks` (RAG). This separation keeps memory retrieval fast and contextually relevant.

## Code Quality Standards

**Backend (Python):**
- Formatter: Black (line-length: 88)
- Linter: Ruff (rules: E, W, F, I, N, UP, B, C4, PT, RUF)
- Type hints required on public interfaces; use `str | None`, `list[str]`, `dict[str, Any]`
- Imports: stdlib → third-party → local (`from app.core.config import get_settings`)
- Logger per module: `logger = structured_logger` (loguru, JSON format)

**Frontend (TypeScript):**
- Linter: ESLint (extends `next/core-web-vitals`, `next/typescript`)
- Formatter: Prettier (double quotes, semi, 2-space indent, max 100 chars)
- File names: `kebab-case.tsx`, components: `PascalCase`
- shadcn/ui New York style, slate base color, 8-point Tailwind grid

## Windows-Specific Notes

- Celery: always `--pool=solo` (prefork crashes with spawn on Windows)
- asyncio: `WindowsSelectorEventLoopPolicy` set in `celery_app.py`
- react-dropzone: must be v15.0.0+ (v14 incompatible with React 19 event delegation)

## Git Commit Rules

No AI tool trailers. Forbidden in commit messages:
- `Co-authored-by:` / `Assisted-by:` / `Generated with` / `Powered by`

Correct format:
```
feat: add inline edit endpoint for CV text rewriting
fix: normalize suggestion keys before results render
refactor: extract ProgressTask base class to document_processing
```

## Development Workflow

**Required local services:** PostgreSQL 16+ with pgvector, Redis

**GSD commands** (for structured phase work):
- `/gsd:quick` — Small fixes, ad-hoc tasks
- `/gsd:execute-phase {N}` — Execute planned phase
- `/gsd:debug` — Investigation and bug fixing
- `/gsd:progress` — Check project status

**Planning files in `.planning/`:**
- `ROADMAP.md` — Phase breakdown
- `STATE.md` — Current position and key decisions
- `phases/{NN}-{slug}/` — Per-phase plans and context

For comprehensive conventions, see `.github/copilot-instructions.md`.
