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

**Data Flow:** Upload → R2 storage → `process_document_task` → `nlp_analysis_task` → `scoring_task` → `grammar_check_task` → `llm_suggest_task` (writes `cv_document`, sets COMPLETE) → SSE streaming → Results / Workspace

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
- Scoring via embedding cosine similarity against anchor phrases (clarity 40%, impact 25%, completeness 20%, relevance 15%)
- Grammar check is LLM-based (KoboiLLM), not LanguageTool
- Workspace editor: Tiptap v3 + Y.js (pycrdt-websocket on backend, y-websocket on frontend) for collaborative editing

## Essential Commands

### Backend (Python/FastAPI)

**CRITICAL: Always activate Conda environment first:**
```bash
conda activate sbk-cv-analyzer
```

**Development server:**
```bash
cd backend
uvicorn app.main:app --reload --port 8000
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

All routes under `/api/v1/`:

| Tag | Routes |
|-----|--------|
| upload | `POST /upload` |
| jobs | `GET /jobs/{job_id}`, `GET /jobs/{job_id}/status` |
| stream | `GET /stream/{job_id}` (SSE) |
| results | `GET /results/{job_id}` |
| workspace | `GET /workspace/{job_id}`, `PUT /workspace/{job_id}/draft` |
| inline-edit | `POST /inline-edit` |
| export | `GET /export/{job_id}/pdf` |
| comparison | `POST /compare/{job_id}` |
| chat | `POST /chat/{job_id}` (SSE streaming) |

## Service Architecture

**`backend/app/services/`:**
- `parser.py` — Document text extraction (PyMuPDF + python-docx) with OCR fallback
- `storage.py` — Cloudflare R2 via boto3 (presigned URLs, sync methods)
- `ocr.py` — OCR fallback for scanned PDFs
- `nlp/` — spaCy-based skill extractor, section detector, entity extractor
- `scoring/scorer.py` — Main scoring orchestrator; calls `score_dimension()` per axis
- `scoring/embeddings.py` — `get_embedding()` + `cosine_similarity()` via KoboiLLM API
- `scoring/anchors.py` — Anchor phrases for 4 scoring dimensions
- `grammar/checker.py` — LLM-based grammar/spelling checker (NOT LanguageTool)
- `ats/checker.py` — ATS compatibility checker
- `rag/embeddings.py` — RAG embedding calls
- `rag/retriever.py` — Retrieves top-K chunks from pgvector
- `rag/chunker.py` — Chunks knowledge base text for ingestion
- `anchor_service.py` — `compute_suggestion_anchors()` for workspace highlight anchors
- `llm/koboi_llm_service.py` — Primary LLM service (OpenAI-compatible KoboiLLM)
- `llm/protocol.py` — `LLMService` Protocol + `SuggestionsOutput` Pydantic schema
- `llm/score_explainer.py` — Explains scores in natural language
- `llm/inline_edit_service.py` — Rewrites CV text per user prompt
- `llm/chat_context_builder.py` — Builds chat context from job scores + cv_document
- `llm/hf_llm_service.py` — Hugging Face Inference API (secondary/fallback)
- `llm/metrics.py` — LLM token usage counter (Prometheus)

**Celery Tasks (`backend/app/tasks/`):**
- `document_processing.py` — `process_document_task`; defines `ProgressTask` base class
- `nlp_analysis.py` — `nlp_analysis_task`
- `scoring.py` — `scoring_task`
- `grammar_check.py` — `grammar_check_task`
- `llm_suggest.py` — `llm_suggest_task` — **final task**; writes `job.cv_document` + sets `COMPLETE`
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

## Key Design Decisions

1. **KoboiLLM over Claude/OpenAI directly** — OpenAI-compatible API; both LLM completions and embeddings go through the same base URL + key
2. **Embedding-based scoring** — Cosine similarity of CV text vs anchor phrases (no rule regex), gracefully degrades (returns 50) if embedding fails
3. **Celery `--pool=solo`** — Required on Windows; prefork uses spawn which crashes
4. **`asyncio.WindowsSelectorEventLoopPolicy`** — psycopg requires SelectorEventLoop; set in `celery_app.py`
5. **`pyproject.toml` as dependency source** — `requirements.txt` is for tooling compat only; always install via `pip install -e backend`
6. **No `alembic autogenerate` for vector indexes** — Must add hnsw index manually in migrations
7. **Grammar via LLM** — KoboiLLM replaces LanguageTool for grammar/spelling; prompts return structured JSON

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
