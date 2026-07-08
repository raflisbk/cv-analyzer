# AGENTS.md

Guide for AI agents working in this repository.

## Project Overview

**pathkr CV Analyzer** — a production CV/resume analyzer: upload a PDF/DOCX, get multi-dimensional scoring, AI-powered suggestions, grammar checks, ATS compliance, and job role comparison. Built as a portfolio showcase of AI engineering patterns (LLM integration, RAG, async pipelines, CRDT collaboration, SSE streaming).

Monorepo: `backend/` (FastAPI + Python 3.13.9) + `frontend/` (Next.js 15 + React 19). Docker Compose provides Postgres (pgvector) and Redis only — app servers run locally.

---

## Commands

### Backend

```bash
conda activate sbk-cv-analyzer    # REQUIRED before everything
cd backend

# Dev server
python run.py                     # Windows-compatible (sets SelectorEventLoopPolicy)
# uvicorn app.main:app --reload --port 8000  # Works on Linux/Mac; on Windows, use run.py instead

# Celery worker (Windows must use --pool=solo)
celery -A app.tasks.celery_app worker --loglevel=info --pool=solo

# Database
alembic upgrade head
alembic revision --autogenerate -m "description"

# Tests
pytest
pytest tests/test_upload_api.py -v
pytest --cov=app

# Code quality
black .
ruff check --fix .

# Install deps (pyproject.toml is source of truth)
pip install -e .
```

### Frontend

```bash
cd frontend
npm run dev          # http://localhost:3000
npm run build
npm run lint
npx tsc --noEmit
npx prettier --write .
npm run test         # vitest run
npm run test:watch   # vitest --watch
```

### E2E Tests (Playwright)

```bash
cd frontend

# Prerequisites: backend + Celery + Postgres + Redis must be running
npm run test:e2e         # headless Chromium
npm run test:e2e:headed  # with browser visible
npm run test:e2e:ui      # with Playwright UI

# Run specific test file
npx playwright test e2e/comparison.spec.ts --reporter=list
```

**E2E test structure** (31 tests across 5 files):
- `e2e/helpers.ts` — Shared utilities: DOCX builder (ZIP of XML files with CRC32), `uploadCV()`, `waitForJobComplete()`, `ensureSampleCV()`
- `e2e/shared-job.ts` — Singleton that reuses known-completed job IDs to avoid Celery queue backlog
- `e2e/landing.spec.ts` — 9 tests: landing page, /cv-analyzer, /job-finding, /cv-builder
- `e2e/upload.spec.ts` — 5 tests: upload page static, file preview, invalid file toast, full upload flow
- `e2e/results.spec.ts` — 8 tests: results page static, score display, tab switching, export bar, navigation
- `e2e/workspace.spec.ts` — 5 tests: workspace shell, footer buttons, comparison toggle, three-column layout
- `e2e/comparison.spec.ts` — 4 tests: JD textarea, button enable/disable, comparison submission

**Key patterns:**
- Tests requiring completed analysis use `getSharedJob()` (known-completed job IDs with `comparison_status: null`)
- Comparison tests use `getCleanJob()` which prefers jobs without prior comparison attempts
- DOCX is built programmatically (not PDF) because PyMuPDF can't extract text from minimal programmatic PDFs
- `test.setTimeout()` inside `beforeAll` is required (default 30s beforeAll timeout is too short)
- Playwright config: single worker, Chromium only, `fullyParallel: false`

### Makefile (from repo root)

```bash
make backend    # Starts backend server (python run.py in conda env)
make celery     # Starts Celery worker (--pool=solo)
make frontend   # Starts frontend dev server
make migrate    # Runs alembic upgrade head
make lint       # ruff check .
make format     # black .
make test       # pytest
```

All backend make commands use `conda run -n sbk-cv-analyzer --no-capture-output`.

### Infrastructure

```bash
docker compose up -d   # Starts Postgres (pgvector/pgvector:pg16) + Redis (redis:7-alpine)
docker compose down -v  # Stop + delete volumes (reset DB)
```

## Git Commit Rules

**All commits must be free of AI-generated trailers.** Do not include:

- `Co-authored-by:` (GitHub Copilot, ChatGPT)
- `Assisted-by:` (Claude Code, Crush)
- `Generated with ...` / `Powered by ...` (branding AI tools)
- Similar signature trailers from Cursor, Windsurf, etc.

A `.githooks/commit-msg` hook strips `Co-authored-by:` lines automatically via awk. If a tool adds trailers, clean before push:
```bash
git commit --amend
# Remove trailer lines from editor, save
```

---

## Package Installation Authorization

You are authorized to install npm packages in `frontend/` when needed for implementing state-of-the-art features. Rules:

- Install only well-maintained, widely-adopted packages (e.g., GSAP, framer-motion, Three.js)
- Always use the latest stable version (`npm install <package>`)
- Do not install duplicate functionality (e.g., don't add both GSAP and anime.js)
- Backend packages: follow existing conda/pip workflow — no special authorization needed beyond what's already documented

---

## Architecture

### Backend Processing Pipeline

Upload triggers a **5-task Celery chain** (each task reads from DB independently via `.si()` immutable signatures — no return values flow between tasks):

```
process_document_task → nlp_analyze_task → score_cv_task → grammar_check_task → llm_suggest_task
```

**Critical:** `llm_suggest_task` is the ONLY task that sets `JobStatus.COMPLETE`. If it's skipped or the chain breaks before it, the job stays in `ANALYZING` forever. The `_persist_results()` method writes `job.status = JobStatus.COMPLETE` atomically alongside `cv_document`, `suggestions`, and `suggestion_anchors`.

**Comparison is separate:** `compare_cv_task` runs via `POST /jobs/{id}/compare`, uses its own `comparison_status` field, and never affects `Job.status`.

### SSE Progress Flow

Tasks write progress to Redis (`SETEX` + `PUBLISH` on channel `job:updates:{job_id}`) → FastAPI SSE endpoint (`/api/v1/stream/{job_id}`) subscribes via `redis.asyncio` pubsub → Frontend `useJobStream` hook consumes via `EventSource`.

No heartbeat/keepalive — relies solely on pubsub messages.

Frontend has a **safety net**: if SSE doesn't fire "complete" within 8 seconds, it falls back to REST polling `GET /jobs/{id}/results` every 4s. SSE errors (all retries exhausted) also trigger the fallback poll.

### Yjs CRDT Collaboration

The workspace uses Yjs for real-time collaborative editing of the CV draft. Backend runs a `pycrdt-websocket` ASGI sub-app mounted at `/yjs`. Frontend connects via `WebsocketProvider` + `IndexeddbPersistence`. Zustand store (`workspace-v2-store`) is ephemeral — Yjs handles persistence.

### API Response Envelope

Most endpoints return `WrappedResponse[T]`:

```json
{ "data": T | null, "error": { "code": "ERROR_CODE", "message": "..." } | null, "meta": { "request_id": "uuid", "timestamp": "..." } }
```

**Error handling varies by endpoint:**
- Upload, results, workspace, compare, chat: return HTTP 200 with populated `error` field (no raised HTTP errors).
- Export endpoints (`/export/pdf`, `/export/optimized`): return proper HTTP 404/500 with `WrappedResponse` body via `JSONResponse(status_code=...)`.

### LLM Service Architecture

**Primary LLM:** `KoboiLLMService` in `backend/app/services/llm/koboi_llm_service.py` uses the OpenAI-compatible SDK via `CV_ANALYZER_KOBOI_BASE_URL` (default: `https://lite.koboillm.com/v1`). Three methods:

- `_chat(system_prompt, user_prompt, temperature, max_tokens)` → sync, returns full `str`
- `generate_suggestions(cv_text, sections, rag_context)` → sync with tenacity retry (3 attempts, exponential backoff 2-10s), returns dict with `raw_json` + token estimates
- `chat_stream(system_prompt, messages, temperature, max_tokens)` → sync generator with `stream=True`, yields delta chunks for multi-turn chat

**Dead code:** `hf_llm_service.py` in the same directory has zero call sites — do not assume it's the fallback path.

**Other LLM services in `services/llm/`:**
- `archetype_detector.py` — 2-tier LLM detection (domain → archetype within domain, 2 LLM calls per CV)
- `archetype_registry.py` — Domain/archetype lists and descriptions (30 domains, 20-70 archetypes each)
- `chat_context_builder.py` — Builds chat system prompt from job scores + cv_document + memory_chunks
- `inline_edit_service.py` — Rewrites CV text with full cv_text + memory_chunks context
- `score_explainer.py` — Explains scores in natural language
- `jd_analyzer.py` — JD red-flag detection (5 categories: requirements_realism, compensation_transparency, jd_specificity, culture_signals, requirements_mismatch)
- `role_detector.py` — Detects primary job role from CV text via single LLM call
- `metrics.py` — LLM token usage counter (Prometheus)
- `protocol.py` — `LLMService` Protocol + `SuggestionsOutput` Pydantic schema

### Scoring Pipeline

`services/scoring/scorer.py` orchestrates a 4-step pipeline:

1. **LLM scoring** — `score_cv_with_llm()` from `llm_scorer.py`. SCORING_VERSION=`"v5"`, weights: impact 0.35 / clarity 0.30 / relevance 0.20 / completeness 0.15. Ensemble of N runs (`CV_ANALYZER_SCORING_ENSEMBLE_RUNS`, default 3), median per dimension. Redis-cached by `llm_score:{SCORING_VERSION}:{hash}`. Archetype-aware impact guidance from `archetype_detector.py`.
2. **Deterministic metrics** — `deterministic_metrics.py` computes objective signals (quantified bullets, action verbs, passive voice, section coverage, employment gaps)
3. **Score adjustments** — ±10pt nudge based on deterministic signals
4. **JD keyword gap** — `jd_gap.py` when `jd_text` is provided

**Additional grammar clarity penalty:** `_persist_results()` in `llm_suggest.py` applies a post-hoc clarity penalty based on grammar issue count (5 issues = -3, 10 = -5, 20 = -7, 30+ = -10) and recalculates the overall weighted score.

**Dead code in `services/scoring/`:** `anchors.py`, `dynamic_anchors.py`, `role_anchors.py`, `hf_embeddings.py` are pre-v3 anchor/embedding approach — only `embeddings.py::get_embedding` is still used (by `rag/`, not scoring). `text_normalizer.py` exists for text normalization utilities.

### Grammar Check

`services/grammar/checker.py` uses **KoboiLLM** (not LanguageTool). LLM prompts return structured JSON output for both English and Indonesian. LanguageTool was the original implementation but has been fully replaced.

### Auth System

Google OAuth login flow:
- `POST /api/v1/auth/google` — Google access token → verify via Google userinfo endpoint → upsert `User` → JWT cookie
- `GET /api/v1/auth/me` — Read JWT from cookie → return user profile
- `POST /api/v1/auth/logout` — Clear JWT cookie
- `User` model: `google_id`, `email`, `name`, `picture`, `is_active`, relationships to `Job` and `KnowledgeChunk`

Frontend middleware (`middleware.ts`) protects `/workspace-v2/*` and `/results/*` — validates `access_token` cookie JWT structure, redirects to `/?login=required&next=<path>` on failure.

### Chat Endpoint

`POST /api/v1/jobs/{id}/chat` is **real LLM** (not mock). Uses `KoboiLLMService.chat_stream()` with memory retrieval via `retrieve_job_memory()`. However, the streaming is **pseudo-streaming**: it collects all tokens first via `asyncio.to_thread(list(...))`, then replays them one-by-one. There's an initial blocking delay before any tokens reach the client. Emits `{"type":"connected"}`, then `{"token": token}` per token, then `{"type":"complete"}`. Both turns are indexed to job memory via `index_chat_message()`.

---

## Code Organization

### Backend (`backend/app/`)

```
main.py              # FastAPI app, CORS, Sentry (conditional), rate limiting, /health, Yjs mount
core/                # config.py (pydantic-settings, CV_ANALYZER_ prefix), logging, security, auth, limiter
db/                  # session.py (async SQLAlchemy + psycopg), base.py (declarative base)
models/              # Job (heavy JSONB), JobStatus, User (Google OAuth), JobRole, KnowledgeChunk, JobMemoryChunk
schemas/             # Pydantic v2 — analysis, workspace, anchors, inline_edit, job, upload, common
api/v1/              # router.py (assembles v1 router with 10 sub-routers)
  endpoints/         # auth, upload, jobs, stream, results, workspace, inline_edit, export, compare, chat, yjs
  websocket/         # yws_handler.py (Yjs WebSocket)
services/
  storage.py         # Cloudflare R2 via boto3, UUID filenames, 24h TTL via metadata
  parser.py          # PyMuPDF → EasyOCR fallback chain, quality gate (score ≥ 0.3)
  ocr.py             # EasyOCR wrapper, lazy singleton
  pdf_to_html.py     # CV text → semantic HTML (section headers, bullets, role patterns)
  anchor_service.py  # PDF coordinate mapping for suggestion annotations
  pdf_export.py      # WeasyPrint HTML→PDF (pinned to 60.0, pydyf 0.8.0)
  validation.py      # Triple file validation (extension, MIME, magic bytes)
  nlp/               # section_detector, skill_extractor (~195 curated skills), entity_extractor
  scoring/           # scorer.py (orchestrator), llm_scorer.py (v5 LLM-based), deterministic_metrics.py, jd_gap.py
                      # Dead code: anchors.py, dynamic_anchors.py, role_anchors.py, hf_embeddings.py
  grammar/           # checker.py — LLM-based (KoboiLLM, not LanguageTool)
  llm/               # koboi_llm_service.py (primary), protocol.py, chat_context_builder.py,
                      # inline_edit_service.py, score_explainer.py, archetype_detector.py,
                      # archetype_registry.py, jd_analyzer.py, role_detector.py, metrics.py
                      # Dead code: hf_llm_service.py
  rag/               # BGE-M3/OpenAI embeddings + pgvector similarity search (chunker, embeddings, ingestor, retriever)
  ats/               # ATS compliance checker
  memory/            # indexer.py (index_cv_sections, index_analysis_summary, index_edit, index_chat_message),
                      # retriever.py (retrieve_job_memory with cosine similarity)
tasks/               # Celery tasks (document_processing → nlp_analysis → scoring → grammar_check → llm_suggest, comparison, cleanup)
templates/           # Jinja2 HTML templates for PDF export (cv_analysis_report.html, cv_optimized.html)
```

### Frontend (`frontend/`)

```
app/
  page.tsx                          # Landing page
  layout.tsx                        # Inter + Bricolage Grotesque fonts, QueryProvider, UploadModalProvider
  results/[job_id]/page.tsx         # Analysis results with 5 tabs
  workspace-v2/[job_id]/page.tsx    # Collaborative CV editor workspace
  workspace-v2/new/page.tsx         # Upload entry to workspace
  cv-analyzer/page.tsx              # Upload page
  job-finding/page.tsx              # Job search page
  cv-builder/page.tsx               # CV builder placeholder
middleware.ts                        # Auth gating for /workspace-v2/* and /results/* (JWT cookie check)
components/
  upload/              # upload-zone, processing-stages, document-preview
  landing/             # Hero, features, stats, navbar, footer, upload overlay
  results/             # 5-tab results display, gauge charts, skill lists, suggestion cards
  workspace-v2/        # Shell, PDF viewer, rich-text editor, chat, annotation overlay, inline edit
  ui/                  # shadcn/ui (New York style, slate base), custom components
  providers/           # QueryProvider (React Query 5), UploadModalProvider
hooks/
  use-upload.ts        # React Query mutation, 5MB client-side validation
  use-job-stream.ts    # SSE streaming with 8s safety fallback to REST polling
  use-job-results.ts   # Fetch results once job is complete
  use-chat-stream.ts   # SSE via fetch+ReadableStream (not EventSource), manual line parsing
  use-draft-save.ts    # Debounced auto-save (800ms debounce, 5s maxWait) → PATCH
  use-inline-edit.ts   # Text selection → AI rewrite, Yjs persistence for edit state
  use-annotation-hover.ts  # 1.5s hover delay, Floating UI
  use-workspace-doc.ts     # Yjs WebsocketProvider + IndexedDB persistence
lib/
  api.ts               # apiFetch<T> wrapper, handles WrappedResponse envelope, throws ApiError
  sse.ts               # SSEConnection class with auto-reconnect (max 5, exp backoff 1s→30s)
  types.ts             # TypeScript types mirroring backend schemas
  normalize-analysis-result.ts  # Normalizes suggestion item keys only (original_text → originalText)
  workspace.ts         # Workspace utilities
  workspace-utils.ts   # Annotation coordinate math
  yjs-provider.ts      # Yjs provider factory
  annotation-utils.ts  # Annotation helpers
  stores/              # Zustand stores (workspace-v2-store — ephemeral, no persist middleware)
  tiptap/              # Custom TipTap mark extension for suggestion highlights
  hooks/               # use-virtual-element (internal lib hook)
```

**API proxy:** `next.config.js` rewrites `/api/v1/:path*` → `BACKEND_URL` (env var, defaults to `http://127.0.0.1:8000`). Yjs WebSocket is NOT proxied — frontend connects directly to `ws://{API_HOST}/yjs/{job_id}`.

---

## Non-Obvious Patterns & Gotchas

### Backend

- **Windows Celery:** Must use `--pool=solo`. Prefork uses `spawn` which crashes on Windows. `celery_app.py` sets `WindowsSelectorEventLoopPolicy` for psycopg async compat.
- **run.py reload disabled by default:** On Windows, uvicorn reload spawns a child process that can't be terminated with Ctrl+C. Set `UVICORN_RELOAD=1` env var to re-enable.
- **Async in sync Celery:** All tasks use `asyncio.run()` inside sync Celery task functions to bridge to async SQLAlchemy. The comparison task mirrors the exact same structure as llm_suggest.
- **JSONB isinstance guards:** Code reads like `safe_scores = job.scores if isinstance(job.scores, dict) else None` everywhere — this exists because MagicMock-based tests don't properly set JSONB fields. Don't remove these guards.
- **LLM failure = partial success:** `llm_suggest_task` catches all exceptions, saves `suggestions=None`, still sets `COMPLETE`. Frontend must distinguish `null` (failed) vs `[]` (empty) vs `[...]` (data). This tri-state pattern applies to `suggestions`, `comparison_result`, and other optional JSONB fields.
- **LLM output repair:** `_repair_llm_output()` in `llm_suggest.py` patches missing fields from LLM responses because the model frequently omits `type`, `original_text`, etc. Uses keyword heuristics to infer missing `type` values.
- **SSE endpoint DB session leak:** `stream.py` manually creates session via `async_session_maker()` instead of `Depends(get_db)` — using `Depends` with `StreamingResponse` leaks connections. The session is opened and closed inside a scoped `async with` block before entering the long-lived pubsub listen loop.
- **PDF proxy for CORS:** `/jobs/{id}/file/proxy` streams PDF from R2 to avoid CORS issues with `react-pdf`. Frontend hardcodes this path.
- **Scoring is LLM-based (v5):** `llm_scorer.py` prompts the LLM for all 4 dimensions. Weights: impact 0.35, clarity 0.30, relevance 0.20, completeness 0.15. Bump `SCORING_VERSION` whenever prompt/weights change — it's baked into the Redis cache key.
- **Grammar clarity penalty:** Applied post-hoc in `_persist_results()` based on grammar issue count, recalculates overall weighted score.
- **Anchor service search strategy:** 3-tier: full text (first 100 chars) → first 60 chars → whitespace-normalized first 40 chars. Anchors are non-fatal (returns `[]` on failure). Tracks `seen_positions` to skip duplicate rects.
- **Deterministic suggestion IDs:** `"{section}_{item_idx}_{card_idx}"` — same formula in backend and frontend.
- **Skill extraction:** Exact case-insensitive matching against ~195 curated skills. No fuzzy matching (removed ESCO taxonomy due to false positives).
- **Redis caching:** LLM suggestions cached at `llm_suggestions:{job_id}` (24h TTL), comparison at `comparison:{job_id}:{jd_hash[:16]}` (24h TTL), scores at `llm_score:{SCORING_VERSION}:{hash}`.
- **Chat is pseudo-streaming:** `_stream_llm_response()` collects all tokens first via `asyncio.to_thread(list(...))`, then replays one-by-one. Initial blocking delay before any tokens reach client.
- **Malformed JSONB handling:** All JSONB reads wrapped in try/except, returning `None` on parse failure.
- **WeasyPrint is CPU-bound:** Export endpoints use `run_in_executor` to avoid blocking the async event loop. WeasyPrint version is pinned to 60.0 with pydyf 0.8.0 — newer versions have incompatible pydyf APIs.
- **validate_output() bug:** `HFLLMService.validate_output()` has an indentation issue where `raise ValueError` is outside its `if` block, so it always raises when called. This is likely dead code since the callers don't invoke it directly.
- **.env.example is outdated:** Missing `CV_ANALYZER_KOBOI_API_KEY`, `CV_ANALYZER_KOBOI_BASE_URL`, `CV_ANALYZER_EMBEDDING_MODEL`, `CV_ANALYZER_EMBEDDING_DIMENSIONS`, `CV_ANALYZER_SCORING_ENSEMBLE_RUNS`, `CV_ANALYZER_JWT_*`, `CV_ANALYZER_GOOGLE_CLIENT_ID`. Still references HuggingFace as primary provider and `Qwen/Qwen2.5-7B-Instruct` / `BAAI/bge-m3`, while `config.py` has moved to `openai/gpt-5.1` and `openai/text-embedding-3-large`.
- **Alembic env.py imports all models:** `Job`, `JobMemoryChunk`, `KnowledgeChunk`, `User` — autogenerate will detect schema changes in all of them. (Previously only imported `Job`.)
- **Two inline-edit endpoints:** `POST /api/v1/jobs/{id}/inline-edit` (in `inline_edit.py`, has job context + full cv_text + job memory, used by `InlineEditPopover` in PDF viewer) and `POST /api/v1/ai/improve` (in `workspace.py`, legacy, no job context, used by `InlineAIPopup` in rich-text-editor). The PDF-viewer path is the primary workspace flow.
- **No auth schemas:** The auth endpoint defines its response models inline in `auth.py`, not in `schemas/`. There is no `schemas/auth.py`.
- **Yjs endpoint not in v1 router:** `yjs.py` exists in `endpoints/` but is not registered in `api/v1/router.py`. Yjs is mounted as a sub-app at `/yjs` in `main.py` instead.

### Frontend

- **Suggestion key normalization is narrow:** `normalize-analysis-result.ts` only normalizes `original_text → originalText` and `after_text → afterText` on suggestion items, NOT a blanket snake_case→camelCase conversion of all API fields. Most fields already arrive in the expected format.
- **SSE vs fetch streaming:** Job progress uses `EventSource` (via `SSEConnection` class in `lib/sse.ts`), but chat uses raw `fetch` + `ReadableStream` with manual `TextDecoder` line parsing.
- **Suggestion highlighting in TipTap:** Done via regex HTML injection (`<span data-suggestion-id>`) before setting editor content, NOT using TipTap mark decorations.
- **Annotation coordinates:** PDF points, top-left origin, y-down. Scale factor: `containerWidth / pageWidth`. No coordinate flip needed.
- **Zustand store is ephemeral:** `workspace-v2-store` has no persist middleware — Yjs handles persistence via IndexedDB.
- **React 19 + react-dropzone:** Must be v15.0.0+ (v14 incompatible with React 19).
- **Draft save debouncing:** 800ms debounce, 5s `maxWait` for force flush. State machine: `idle → unsaved → saving → saved → idle` (auto-clears after 1.5s).
- **Inline edit selection limits:** 2–500 character range enforced. Uses Yjs `Y.Map("inline_edits")` for persistence.
- **Tiptap `immediatelyRender: false`:** Required on ALL `useEditor()` calls to prevent Next.js 15 SSR hydration mismatch with ProseMirror.
- **Phase comments:** Code contains `Phase 14`, `Phase 17` etc. comments — these track delivery milestones, not technical phases.
- **Vitest uses jsdom environment** with `@` path alias configured.
- **Webpack patches in next.config.js:** Patches for `pdfjs-dist` compatibility with Next.js 15 (disables `canvas`, handles `.mjs` modules).
- **Google avatar images:** `next.config.js` allows `lh3.googleusercontent.com` as remote image pattern.
- **No emoji in UI:** Never use emoji characters in any user-facing component. If an icon is needed, use SVG icons from `components/ui/feature-icons.tsx` (or add new ones there). This applies to all pages, sections, cards, and interactive elements. Arrows (->) must use inline SVGs, not Unicode arrow characters.

### Database

- **Async psycopg driver:** Connection string uses `postgresql+psycopg://` (not `postgresql+asyncpg://`). Config constructed in `Settings.database_url` property.
- **pgvector:** Requires `pgvector/pgvector:pg16` Docker image, not plain Postgres.
- **HNSW index for >2000 dims:** pgvector HNSW rejects `vector_cosine_ops` if column dimension > 2000. Use halfvec cast: `USING hnsw ((embedding::halfvec(3072)) halfvec_cosine_ops)`. Both `knowledge_chunks` and `job_memory_chunks` use this pattern. Never let `alembic --autogenerate` remove it — add manually.
- **Job model is JSONB-heavy:** `nlp_result`, `scores`, `suggestions`, `grammar_issues`, `ats_checks`, `comparison_result`, `messages`, `workspace_draft`, `cv_document`, `suggestion_anchors` — all stored as JSONB columns on the `jobs` table. `stages`, `file_metadata`, `result` are plain `JSON` (not JSONB). `yjs_snapshot` is `LargeBinary`.
- **User model:** `users` table with `google_id`, `email` (both unique+indexed), `name`, `picture`, `is_active`. Relationships to `Job` and `KnowledgeChunk`. Uses `TimestampMixin`.

---

## Job Memory System

`job_memory_chunks` table stores per-job activity as `Vector(3072)` embeddings. 4 content types indexed:

- `cv_section` — indexed by `index_cv_sections()` in `llm_suggest_task` after completion
- `analysis` — indexed by `index_analysis_summary()` in `llm_suggest_task` after completion
- `edit` — indexed by `index_edit()` in `inline_edit.py` endpoint after each inline edit
- `chat` — indexed by `index_chat_message()` in `chat.py` endpoint after each chat turn

**Retrieval:** `retrieve_job_memory(job_id, query, limit=5, content_types=None)` — embeds query, cosine similarity over `JobMemoryChunk`, returns top-K content strings.

**Both indexing and retrieval are best-effort** — failures are caught and logged, never block completion.

---

## Testing

### Backend

Tests live in `backend/tests/`. All external dependencies are mocked — no real spaCy, OpenAI, DB, or LanguageTool in tests.

**conftest.py** stubs heavy modules at import time:
```python
# These must run BEFORE any app imports
for _mod in ("spacy", "easyocr", "cv2", "pdf2image"):
    if _mod not in sys.modules:
        sys.modules[_mod] = MagicMock()
```

Fixtures provide: `sample_cv_text` (a realistic CV with contact info, summary, experience, education, skills), `mock_nlp` (patches `app.services.nlp.model.get_nlp`), `mock_openai_embedding` (patches `app.services.scoring.embeddings.get_embedding`, returns `[0.1] * 1536`).

**Why the isinstance guards exist:** Because mocks don't properly simulate JSONB dicts, production code uses `isinstance(x, dict)` checks everywhere. Don't remove these.

**pytest config** (in `pyproject.toml`): `addopts = "-ra -q --strict-markers --strict-config"`, `testpaths = ["tests"]`, `pythonpath = ["."]`.

### Frontend

Vitest with jsdom environment. Config in `vitest.config.ts`. Path alias `@` → project root. Setup file: `vitest.setup.ts`. Testing Library (`@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`) available.

---

## Key Environment Variables

All backend env vars prefixed `CV_ANALYZER_`. See `backend/.env.example` (note: `.env.example` is outdated — see gotchas above).

| Variable | Purpose | Default |
|----------|---------|---------|
| `CV_ANALYZER_DB_HOST/PORT/NAME/USER/PASSWORD` | PostgreSQL connection | localhost:5432/cv_analyzer/postgres |
| `CV_ANALYZER_REDIS_URL` | Redis for Celery broker/backend + SSE pub/sub | `redis://localhost:6379/0` |
| `CV_ANALYZER_R2_ENDPOINT/ACCESS_KEY/SECRET_KEY/BUCKET` | Cloudflare R2 storage | bucket: `cv-uploads` |
| `CV_ANALYZER_KOBOI_API_KEY` | KoboiLLM API key (primary LLM provider) | `""` |
| `CV_ANALYZER_KOBOI_BASE_URL` | KoboiLLM base URL | `https://lite.koboillm.com/v1` |
| `CV_ANALYZER_LLM_MODEL` | LLM model ID | `openai/gpt-5.1` |
| `CV_ANALYZER_LLM_MAX_TOKENS` | Max LLM output tokens | `4096` |
| `CV_ANALYZER_LLM_CACHE_TTL` | Redis cache TTL for LLM results | `86400` (24h) |
| `CV_ANALYZER_EMBEDDING_MODEL` | Embedding model | `openai/text-embedding-3-large` |
| `CV_ANALYZER_EMBEDDING_DIMENSIONS` | Embedding vector dimensions | `3072` |
| `CV_ANALYZER_SCORING_ENSEMBLE_RUNS` | Number of LLM scoring runs per CV (median taken) | `3` |
| `CV_ANALYZER_HF_API_KEY` | HuggingFace API key (legacy, still used by some features) | `""` |
| `CV_ANALYZER_RAG_TOP_K` | Top-K retrieval chunks | `5` |
| `CV_ANALYZER_CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:3000` |
| `CV_ANALYZER_MAX_FILE_SIZE` | Max upload size in bytes | `5242880` (5MB) |
| `CV_ANALYZER_UPLOAD_RATE_LIMIT` | Rate limit string | `5/hour` |
| `CV_ANALYZER_ANALYSIS_RATE_LIMIT` | Analysis rate limit | `5/hour` |
| `CV_ANALYZER_JWT_SECRET` | JWT signing secret | *(required)* |
| `CV_ANALYZER_JWT_ALGORITHM` | JWT algorithm | `HS256` |
| `CV_ANALYZER_JWT_EXPIRY_DAYS` | JWT cookie expiry | `7` |
| `CV_ANALYZER_GOOGLE_CLIENT_ID` | Google OAuth client ID | `""` |
| `CV_ANALYZER_SENTRY_DSN` | Sentry DSN (optional) | `""` |
| `CV_ANALYZER_LOG_LEVEL` | Log level | `INFO` |

Frontend: `NEXT_PUBLIC_API_URL` (default: `http://localhost:8000/api/v1`). `BACKEND_URL` (default: `http://127.0.0.1:8000`) used by Next.js rewrites.

---

## Celery Task Configuration

```
task_time_limit=600           # 10 minutes max per task
task_soft_time_limit=540      # 9 minutes soft limit
worker_prefetch_multiplier=1  # One task at a time per worker
worker_max_tasks_per_child=50 # Restart worker after 50 tasks
```

Scheduled tasks: `cleanup-expired-files` runs every hour via `celery beat`.

---

## Ruff Linting Rules

Enabled rule sets: E, W, F, I, N, UP, B, C4, DTZ, T10, EM, ISC, ICN, PIE, PT, Q, RSE, RET, SIM, TID, TCH, ARG, PTH, ERA, PL, TRY, RUF.

Ignored rules: E501 (handled by black), B008, PLR0913, TRY003, UP046, PLR2004, TRY300, PLR0912, PLR0915, PLC0415, N815, ARG001, ARG002, RUF012, RUF001, EM101, EM102, TRY301, PLW2901, I001, UP042, N806.

Per-file: `__init__.py` allows F401 (unused imports), `tests/*` ignores ARG and PLR2004 (magic values).
