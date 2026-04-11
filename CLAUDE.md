# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Mandatory Rules

1. **Backend Rule #1: Always activate Conda first**
    - Run `conda activate sbk-cv-analyzer` before any backend operation.
    - This includes server start, migrations, Celery workers, tests, linting, formatting, and package installation.

## Project

**CV Analyzer** — A portfolio project demonstrating AI Engineer mastery through a production-ready CV/resume analyzer with multi-dimensional scoring, LLM-powered suggestions, and job role comparison.

**Core Value:** Every technical decision prioritizes showcasing modern AI engineering patterns — LLM integration, RAG architecture, async processing, streaming responses, and production deployment.

## Architecture

**Monorepo Structure:**
- `backend/` — FastAPI application (Python 3.11+)
- `frontend/` — Next.js 15 with App Router (TypeScript/React 19)
- `.planning/` — GSD workflow artifacts (gitignored, local only)

**Tech Stack:**
- Backend: FastAPI + PostgreSQL (pgvector) + Redis/Celery + Cloudflare R2
- Frontend: Next.js 15 + shadcn/ui + Tailwind CSS
- AI: Claude/OpenAI APIs + RAG with vector embeddings
- Deploy: Vercel (frontend) + Railway (backend)

**Key Architecture Patterns:**
- Async job processing with Celery for non-blocking operations
- Server-Sent Events (SSE) for real-time progress streaming to frontend
- RAG architecture with pgvector for semantic search of CV best practices
- Structured JSON logging with loguru
- Document parsing with OCR fallback for scanned PDFs

**Data Flow:** Upload → R2 storage → Background task → Parser → NLP extraction → LLM analysis → SSE streaming → Results display

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
alembic upgrade head                    # Apply migrations
alembic revision --autogenerate -m "msg"  # Create migration
```

**Celery worker (background tasks):**
```bash
cd backend
celery -A app.tasks.celery_app worker --loglevel=info --pool=solo
```

**Code quality:**
```bash
cd backend
black .                  # Format code
ruff check .            # Lint code
ruff check --fix .      # Auto-fix issues
```

**Install dependencies:**
```bash
# From project root (preferred)
pip install -e backend

# Or from backend directory
cd backend && pip install -e .
```

### Frontend (Next.js/React)

**Development server:**
```bash
cd frontend
npm run dev         # http://localhost:3000
```

**Production build:**
```bash
cd frontend
npm run build
```

**Code quality:**
```bash
cd frontend
npm run lint              # ESLint check
npx prettier --write .    # Format code
npx tsc --noEmit          # Type check
```

## Development Workflow

### Environment Setup

**Required services:**
- PostgreSQL 16+ with pgvector extension (local: Docker Compose)
- Redis (for Celery job queue)
- Cloudflare R2 (file storage)

**Backend environment:** `backend/.env` (use `backend/.env.example` as template)
**Frontend environment:** `frontend/.env.local` (if needed)

### GSD Workflow

This project uses GSD (Get Shit Done) for structured development. Before making code changes:

- `/gsd:quick` — Small fixes, doc updates, ad-hoc tasks
- `/gsd:execute-phase {N}` — Execute planned phase work
- `/gsd:debug` — Investigation and bug fixing
- `/gsd:progress` — Check project status

**Planning files in `.planning/`:**
- `ROADMAP.md` — Phase breakdown with dependencies
- `STATE.md` — Current position and decisions
- `phases/{NN}-{slug}/` — Phase-specific plans and context

### Code Quality Standards

**Backend (Python):**
- Formatter: Black (line-length: 88)
- Linter: Ruff (comprehensive rules: E, W, F, I, N, UP, B, C4, etc.)
- Type hints required on public interfaces
- Modern syntax: `str | None`, `list[str]`, `dict[str, Any]`

**Frontend (TypeScript):**
- Linter: ESLint (extends `next/core-web-vitals`, `next/typescript`)
- Formatter: Prettier
- Max line length: 100 characters
- Quotes: double, Semi: always, Indent: 2 spaces

### Project Phases

1. **Phase 1** — Foundation & Document Pipeline (file upload, parsing, async)
2. **Phase 2** — Basic Analysis Engine (NLP scoring, section detection)
3. **Phase 3** — AI Intelligence Layer (LLM suggestions, cost controls)
4. **Phase 4** — Streaming & Comparison (real-time UX, job matching)
5. **Phase 5** — Advanced Features (deployment, polish, optional)

Progress: Phases 1-4 complete, Phase 5 pending.

## Key Design Decisions

1. **Celery over BackgroundTasks** — Enables job persistence, retry, and horizontal scaling
2. **pgvector over separate vector DB** — Single database simplifies deployment and reduces costs
3. **R2 with presigned URLs** — Direct browser upload/download reduces backend bandwidth
4. **SSE over WebSockets** — Simpler for one-way streaming, better for serverless
5. **Async-first architecture** — All I/O operations async, never block on LLM calls
6. **Rule-based + LLM scoring** — Graceful degradation when LLM unavailable
7. **Curated skill whitelist** — ~150 tech skills vs ESCO's 14K cross-industry noise

## File Structure

```
cv-analyzer/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── core/                # Config, logging, security
│   │   ├── db/                  # Database session, base
│   │   ├── models/              # SQLAlchemy models (Job, JobRole, KnowledgeChunk)
│   │   ├── schemas/             # Pydantic schemas (request/response)
│   │   ├── api/                 # API routes (/api/v1/upload, /jobs, etc.)
│   │   ├── services/            # Business logic (parser, nlp, llm, rag, storage)
│   │   ├── tasks/               # Celery tasks (cv_analysis_task, etc.)
│   │   └── templates/           # Jinja2 templates (PDF export)
│   ├── alembic/                 # Database migrations
│   ├── pyproject.toml           # Dependencies + tool config (Black/Ruff)
│   └── requirements.txt         # Pinned dependencies
├── frontend/
│   ├── app/                     # Next.js App Router
│   │   ├── page.tsx             # Homepage (upload)
│   │   ├── results/[job_id]/    # Results page with tabs
│   │   └── layout.tsx           # Root layout
│   ├── components/
│   │   ├── ui/                  # shadcn/ui base components
│   │   ├── upload/              # Upload zone, progress indicator
│   │   └── results/             # Results tabs, charts, comparison
│   ├── hooks/                   # Custom React hooks (useSSE, useCopyToClipboard)
│   └── lib/                     # Utilities (cn, types)
└── .github/
    └── copilot-instructions.md  # Detailed conventions and workflow
```

## Important Notes

**Conda Environment Required:**
Backend Python code MUST run in `sbk-cv-analyzer` conda environment. Verify with:
```bash
conda env list          # Should show * next to sbk-cv-analyzer
python --version        # Should be 3.11+
```

**Windows-Specific:**
- Celery requires `--pool=solo` flag (prefork uses spawn which crashes)
- asyncio requires `WindowsSelectorEventLoopPolicy` (set in celery_app.py)
- react-dropzone must be v15.0.0+ (v14 incompatible with React 19)

**GSD Workflow:**
The `.planning/` directory contains phase plans, UAT results, and execution context. These are gitignored and only exist locally after running GSD commands.

**For comprehensive conventions**, see `.github/copilot-instructions.md`.
