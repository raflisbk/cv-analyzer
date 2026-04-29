# AGENTS.md

Guide for AI agents working in this repository.

## Project Overview

**pathkr CV Analyzer** — a production CV/resume analyzer: upload a PDF/DOCX, get multi-dimensional scoring, AI-powered suggestions, grammar checks, ATS compliance, and job role comparison. Built as a portfolio showcase of AI engineering patterns (LLM integration, RAG, async pipelines, CRDT collaboration, SSE streaming).

Monorepo: `backend/` (FastAPI + Python) + `frontend/` (Next.js 15 + React 19). Docker Compose provides Postgres (pgvector) and Redis only — app servers run locally.

---

## Commands

### Backend

```bash
conda activate sbk-cv-analyzer    # REQUIRED before everything
cd backend

# Dev server
uvicorn app.main:app --reload --port 8000

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

### Infrastructure

```bash
docker compose up -d   # Starts Postgres (pgvector/pgvector:pg16) + Redis (redis:7-alpine)
docker compose down -v  # Stop + delete volumes (reset DB)
```

## Git Commit Rules

**Semua commit harus bersih dari AI-generated trailers.** Dilarang menyertakan:

- `Co-authored-by:` (GitHub Copilot, ChatGPT)
- `Assisted-by:` (Claude Code, Crush)
- `Generated with ...` / `Powered by ...` (branding AI tools)
- Signature trailers serupa dari Cursor, Windsurf, dsb

Jika tool AI menambahkan trailer, hapus sebelum push:
```bash
git commit --amend
# Hapus baris trailer dari editor, simpan
```

---

## Architecture

### Backend Processing Pipeline

Upload triggers a **5-task Celery chain** (each task reads from DB independently via `.si()` immutable signatures — no return values flow between tasks):

```
process_document_task → nlp_analyze_task → score_cv_task → grammar_check_task → llm_suggest_task
```

**Critical:** `llm_suggest_task` is the ONLY task that sets `JobStatus.COMPLETE`. If it's skipped or the chain breaks before it, the job stays in `ANALYZING` forever.

**Comparison is separate:** `compare_cv_task` runs via `POST /jobs/{id}/compare`, uses its own `comparison_status` field, and never affects `Job.status`.

### SSE Progress Flow

Tasks write progress to Redis (`SETEX` + `PUBLISH` on channel `job:updates:{job_id}`) → FastAPI SSE endpoint (`/api/v1/stream/{job_id}`) subscribes via `redis.asyncio` pubsub → Frontend `useJobStream` hook consumes via `EventSource`.

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

### Dual LLM Services

| Service | API Style | Model | Used By |
|---------|----------|-------|---------|
| `HFLLMService` | Raw `text_generation()` with manual Qwen chat template (`<\|im_start\|>`) | From `CV_ANALYZER_LLM_MODEL` setting (default: `Qwen/Qwen2-7B-Instruct`) | `llm_suggest_task` |
| `HFOpenAILLMService` | OpenAI-compatible `chat.completions.create()` via `huggingface_hub.InferenceClient` | Hardcoded `Qwen/Qwen2.5-7B-Instruct` | `compare_cv_task`, inline edit |

**Gotcha:** `HFOpenAILLMService` has a hardcoded model (`Qwen/Qwen2.5-7B-Instruct`) that differs from the settings default (`Qwen/Qwen2-7B-Instruct`). If you change the model, you must update both.

---

## Code Organization

### Backend (`backend/app/`)

```
main.py              # FastAPI app, CORS, Sentry, rate limiting, LanguageTool pre-warm
core/                # config.py (pydantic-settings, CV_ANALYZER_ prefix), logging, security, limiter
db/                  # session.py (async SQLAlchemy + psycopg), base.py (declarative base)
models/              # Job (main model, heavy JSONB), JobRole, KnowledgeChunk
schemas/             # Pydantic v2 models — analysis.py, workspace.py, anchors.py, upload.py, common.py
api/v1/endpoints/    # upload, jobs, stream, results, workspace, compare, chat, export, yjs, inline_edit
services/            # Business logic
  storage.py         # Cloudflare R2 via boto3, UUID filenames, 24h TTL
  parser.py          # PyMuPDF → EasyOCR fallback chain, quality gate (score ≥ 0.3)
  ocr.py             # EasyOCR wrapper, lazy singleton
  pdf_to_html.py     # CV text → semantic HTML (section headers, bullets, role patterns)
  anchor_service.py  # PDF coordinate mapping for suggestion annotations
  pdf_export.py      # WeasyPrint HTML→PDF
  validation.py      # Triple file validation (extension, MIME, magic bytes)
  nlp/               # section_detector, skill_extractor (~195 curated skills), entity_extractor
  scoring/           # scorer.py — HF BGE-M3 embedding cosine similarity against anchor phrases
  grammar/           # checker.py — LanguageTool (primary) → HF Qwen LLM (fallback)
  llm/               # hf_llm_service.py, hf_openai_llm_service.py, provider_manager.py, chat_context_builder.py
  rag/               # BGE-M3 embeddings + pgvector similarity search
  ats/               # ATS compliance checker
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
  cv-analyzer/page.tsx              # Upload page
  job-finding/page.tsx              # Job search page
  cv-builder/page.tsx               # CV builder placeholder
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
  api.ts               # apiFetch<T> wrapper, handles WrappedResponse envelope
  sse.ts               # SSEConnection class with auto-reconnect (max 5, exp backoff 30s)
  types.ts             # TypeScript types mirroring backend schemas
  normalize-analysis-result.ts  # Normalizes suggestion item keys only (original_text → originalText)
  workspace.ts         # Workspace utilities
  workspace-utils.ts   # Annotation coordinate math
  yjs-provider.ts      # Yjs provider factory
  stores/              # Zustand stores (workspace-v2-store — ephemeral, no persist middleware)
  tiptap/              # Custom TipTap mark extension for suggestion highlights
```

---

## Non-Obvious Patterns & Gotchas

### Backend

- **Windows Celery:** Must use `--pool=solo`. Prefork uses `spawn` which crashes on Windows. `celery_app.py` sets `WindowsSelectorEventLoopPolicy` for psycopg async compat.
- **Async in sync Celery:** All tasks use `asyncio.run()` inside sync Celery task functions to bridge to async SQLAlchemy. The comparison task mirrors the exact same structure as llm_suggest.
- **JSONB isinstance guards:** Code reads like `safe_scores = job.scores if isinstance(job.scores, dict) else None` everywhere — this exists because MagicMock-based tests don't properly set JSONB fields. Don't remove these guards.
- **LLM failure = partial success:** `llm_suggest_task` catches all exceptions, saves `suggestions=None`, still sets `COMPLETE`. Frontend must distinguish `null` (failed) vs `[]` (empty) vs `[...]` (data). This tri-state pattern applies to `suggestions`, `comparison_result`, and other optional JSONB fields.
- **LLM output repair:** `_repair_llm_output()` in `llm_suggest.py` patches missing fields from LLM responses because the model frequently omits `type`, `original_text`, etc. The docstring mentions "GLM-4.5-flash" but the actual model is Qwen — stale comment.
- **SSE endpoint DB session leak:** `stream.py` manually creates session via `async_session_maker()` instead of `Depends(get_db)` — using `Depends` with `StreamingResponse` leaks connections. The session is opened and closed inside a scoped `async with` block before entering the long-lived pubsub listen loop.
- **Grammar checker cold start:** LanguageTool downloads ~200MB JAR on first use. `main.py` pre-warms it in a background thread on startup (avoids 30s delay on first request).
- **PDF proxy for CORS:** `/jobs/{id}/file/proxy` streams PDF from R2 to avoid CORS issues with `react-pdf`. Frontend hardcodes this path.
- **Scoring is AI-only** — no rule-based fallback. Requires `CV_ANALYZER_HF_API_KEY` or scoring fails.
- **Anchor service search strategy:** 3-tier: exact match → first 60 chars → whitespace-normalized first 40 chars. Anchors are non-fatal (returns `[]` on failure).
- **Deterministic suggestion IDs:** `"{section}_{item_idx}_{card_idx}"` — same formula in backend and frontend.
- **Skill extraction:** Exact case-insensitive matching against ~195 curated skills. No fuzzy matching (removed ESCO taxonomy due to false positives).
- **Redis caching:** LLM suggestions cached at `llm_suggestions:{job_id}` (24h TTL), comparison at `comparison:{job_id}:{jd_hash[:16]}` (24h TTL).
- **Chat endpoint is mock:** `chat.py` uses `_stream_mock_response()` with character-by-character `asyncio.sleep(0.02)`. Placeholder until real HF streaming is implemented.
- **Malformed JSONB handling:** All JSONB reads wrapped in try/except, returning `None` on parse failure.
- **WeasyPrint is CPU-bound:** Export endpoints use `run_in_executor` to avoid blocking the async event loop. WeasyPrint version is pinned to 60.0 with pydyf 0.8.0 — newer versions have incompatible pydyf APIs.
- **ProviderManager is vestigial:** Exists for potential multi-provider support but currently HF is the only provider. ProviderType enum lists OPENAI and ZAI but neither is actually wired up.

### Frontend

- **Suggestion key normalization is narrow:** `normalize-analysis-result.ts` only normalizes `original_text → originalText` and `after_text → afterText` on suggestion items, NOT a blanket snake_case→camelCase conversion of all API fields. Most fields already arrive in the expected format.
- **SSE vs fetch streaming:** Job progress uses `EventSource` (via `SSEConnection` class in `lib/sse.ts`), but chat uses raw `fetch` + `ReadableStream` with manual `TextDecoder` line parsing.
- **Suggestion highlighting in TipTap:** Done via regex HTML injection (`<span data-suggestion-id>`) before setting editor content, NOT using TipTap mark decorations.
- **Annotation coordinates:** PDF points, top-left origin, y-down. Scale factor: `containerWidth / pageWidth`. No coordinate flip needed.
- **Zustand store is ephemeral:** `workspace-v2-store` has no persist middleware — Yjs handles persistence via IndexedDB.
- **React 19 + react-dropzone:** Must be v15.0.0+ (v14 incompatible with React 19).
- **Draft save debouncing:** 800ms debounce, 5s `maxWait` for force flush. State machine: `idle → unsaved → saving → saved → idle` (auto-clears after 1.5s).
- **Inline edit selection limits:** 2–500 character range enforced. Uses Yjs `Y.Map("inline_edits")` for persistence.
- **Phase comments:** Code contains `Phase 14`, `Phase 17` etc. comments — these track delivery milestones, not technical phases.
- **Vitest uses jsdom environment** with `@` path alias configured.

### Database

- **Async psycopg driver:** Connection string uses `postgresql+psycopg://` (not `postgresql+asyncpg://`). Config constructed in `Settings.database_url` property.
- **pgvector:** Requires `pgvector/pgvector:pg16` Docker image, not plain Postgres.
- **Job model is JSONB-heavy:** `nlp_result`, `scores`, `suggestions`, `grammar_issues`, `ats_checks`, `comparison_result`, `messages`, `workspace_draft`, `cv_document`, `suggestion_anchors` — all stored as JSONB columns on the `jobs` table.
- **Alembic env.py only imports `Job`:** `alembic/env.py` imports `Job` explicitly but NOT `JobRole` or `KnowledgeChunk`. Autogenerate will NOT detect schema changes in those models. If you add columns to `JobRole` or `KnowledgeChunk`, you must either add the import or write the migration manually.

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

Fixtures provide: `sample_cv_text` (a realistic CV with contact info, summary, experience, education, skills), `mock_nlp`, `mock_openai_embedding` (returns `[0.1] * 1536`), `mock_language_tool`.

**Why the isinstance guards exist:** Because mocks don't properly simulate JSONB dicts, production code uses `isinstance(x, dict)` checks everywhere. Don't remove these.

**pytest config** (in `pyproject.toml`): `addopts = "-ra -q --strict-markers --strict-config"`, `testpaths = ["tests"]`, `pythonpath = ["."]`.

### Frontend

Vitest with jsdom environment. Config in `vitest.config.ts`. Path alias `@` → project root. Setup file: `vitest.setup.ts`. Testing Library (`@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`) available.

---

## Key Environment Variables

All backend env vars prefixed `CV_ANALYZER_`. See `backend/.env.example`.

| Variable | Purpose |
|----------|---------|
| `CV_ANALYZER_DB_HOST/PORT/NAME/USER/PASSWORD` | PostgreSQL connection (default: localhost:5432/cv_analyzer/postgres) |
| `CV_ANALYZER_REDIS_URL` | Redis for Celery broker/backend + SSE pub/sub (default: `redis://localhost:6379/0`) |
| `CV_ANALYZER_R2_ENDPOINT/ACCESS_KEY/SECRET_KEY/BUCKET` | Cloudflare R2 storage |
| `CV_ANALYZER_HF_API_KEY` | HuggingFace API for LLM + embeddings (required for scoring) |
| `CV_ANALYZER_LLM_MODEL` | LLM model ID (default: `Qwen/Qwen2-7B-Instruct`) |
| `CV_ANALYZER_LLM_MAX_TOKENS` | Max LLM output tokens (default: 1500) |
| `CV_ANALYZER_LLM_CACHE_TTL` | Redis cache TTL for LLM results (default: 86400 = 24h) |
| `CV_ANALYZER_RAG_EMBEDDING_MODEL` | Embedding model (default: `BAAI/bge-m3`) |
| `CV_ANALYZER_RAG_TOP_K` | Top-K retrieval chunks (default: 5) |
| `CV_ANALYZER_CORS_ORIGINS` | Comma-separated allowed origins (default: `*`) |
| `CV_ANALYZER_MAX_FILE_SIZE` | Max upload size in bytes (default: 5MB) |
| `CV_ANALYZER_UPLOAD_RATE_LIMIT` | Rate limit string (default: `5/hour`) |

Frontend: `NEXT_PUBLIC_API_URL` (default: `http://localhost:8000/api/v1`).

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

Ignored rules: E501 (handled by black), B008, PLR0913 (too many args), TRY003, UP046 (Generic[T] syntax for 3.11 compat).

Per-file: `__init__.py` allows F401 (unused imports), `tests/*` ignores ARG and PLR2004 (magic values).
