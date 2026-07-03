# CV Analyzer - Copilot Instructions

A portfolio project demonstrating AI Engineering mastery through a production-ready CV/resume analyzer with multi-dimensional scoring, LLM-powered suggestions, and job comparison.

**Core Principle:** Every technical decision showcases modern AI engineering patterns — LLM integration, RAG architecture, async processing, streaming responses, and production deployment.

## Architecture Overview

**Monorepo Structure:**
- `backend/` - FastAPI application with async processing (Python 3.x)
- `frontend/` - Next.js 15 with App Router (TypeScript/React)
- `.planning/` - GSD workflow artifacts (roadmap, requirements, phase plans)

**Tech Stack:**
- Backend: FastAPI + PostgreSQL (pgvector) + Redis/Celery + Cloudflare R2
- Frontend: Next.js 15 + shadcn/ui + Tailwind CSS
- AI: Claude/OpenAI APIs + RAG with vector embeddings
- Deploy: Vercel (frontend) + Railway (backend)

**Key Architecture Patterns:**
- Async job processing with Celery for non-blocking operations
- Server-Sent Events (SSE) for real-time progress streaming
- RAG architecture with pgvector for semantic search
- Structured logging (JSON format) with loguru/winston
- Quality validation for document parsing with OCR fallback

## Project Phases

Phase-based development following `.planning/ROADMAP.md`:

1. **Phase 1** (Current) - Foundation & Document Pipeline (file upload, parsing, async architecture)
2. **Phase 2** - Basic Analysis Engine (NLP scoring, section detection)
3. **Phase 3** - AI Intelligence Layer (LLM suggestions, cost controls)
4. **Phase 4** - Streaming & Comparison (real-time UX, job matching)
5. **Phase 5** - Advanced Features (RAG polish, optional)

Progress tracked in `.planning/STATE.md`

## GSD Workflow

**This project uses GSD (Get Shit Done) workflow for structured development.**

### Before Making Code Changes

Start work through a GSD command to maintain planning artifacts:
- `/gsd-execute-phase {N}` - Execute planned phase work
- `/gsd-quick` - Small fixes, doc updates, ad-hoc tasks
- `/gsd-debug` - Investigation and bug fixing

**Do not make direct file changes outside GSD workflow** unless user explicitly requests bypass.

### GSD Commands Reference

**Planning:**
- `/gsd-new-project` - Initialize new project structure
- `/gsd-plan-phase {N}` - Create execution plans for a phase
- `/gsd-discuss-phase {N}` - Gather context before planning
- `/gsd-ui-phase {N}` - Generate UI design contract for frontend phases

**Execution:**
- `/gsd-execute-phase {N}` - Execute all plans in a phase
- `/gsd-execute-plan {plan-file}` - Execute specific plan
- `/gsd-verify-work {N}` - Run UAT testing on phase

**Monitoring:**
- `/gsd-progress` - Check project progress and next steps
- `/tasks` - List background agent status

### Wave Completion Checklist

**After each wave completes, ALWAYS perform these checks:**

1. **Review Generated Files**
   ```bash
   git status
   ```
   Check for any new files or directories created during the wave.

2. **Update .gitignore**
   - Review new files against `.gitignore`
   - Add any sensitive files (logs, temp files, local configs)
   - Add any build artifacts or cache directories
   - Common patterns to check:
     - `*.log` files
     - `.env*` files (except `.env.example`)
     - `__pycache__/`, `.pytest_cache/`, `.ruff_cache/`
     - `node_modules/`, `.next/`
     - Database files (`*.db`, `*.sqlite`)
     - Uploaded files in development

  3. **Update Backend Dependency Manifest**
    - If backend dependencies changed during the wave/phase, update `backend/pyproject.toml` first.
    - Keep `backend/requirements.txt` aligned only when explicitly needed for tooling compatibility.
    - Treat `backend/pyproject.toml` as the source of truth for backend dependency installation.

  4. **Run Linters**
   
   **Backend (Python):**
   ```bash
   conda activate sbk-cv-analyzer
   cd backend
   black .                    # Format code
   ruff check .              # Lint code
   ruff check --fix .        # Auto-fix issues
   ```
   
   **Frontend (TypeScript/React):**
   ```bash
   cd frontend
   npm run lint              # ESLint check
   npx prettier --write .    # Format code
   npx tsc --noEmit          # Type check
   ```

5. **Verify Builds**
   
   **Backend:**
   ```bash
   conda activate sbk-cv-analyzer
   cd backend
   python -c "from app.main import app; print('✓ Import successful')"
   ```
   
   **Frontend:**
   ```bash
   cd frontend
   npm run build             # Ensure build succeeds
   ```

6. **Commit Clean Code**
   - All linting errors fixed
   - All files properly ignored
   - Build passes
   - No sensitive data in commits

### Key GSD Files

- `.planning/PROJECT.md` - Project definition, requirements, constraints
- `.planning/ROADMAP.md` - Phase breakdown with dependencies
- `.planning/STATE.md` - Current position, decisions, metrics
- `.planning/REQUIREMENTS.md` - All v1 requirements with IDs
- `.planning/config.json` - Workflow configuration
- `.planning/phases/{NN}-{slug}/` - Phase-specific plans and context

## Code Conventions

### ⚠️ CRITICAL: Backend Environment Setup

**ALWAYS activate Conda environment before ANY backend operation:**

```bash
conda activate sbk-cv-analyzer
```

**This applies to:**
- Running the dev server (`uvicorn`)
- Installing packages (`pip install`)
- Running migrations (`alembic upgrade`)
- Running Celery workers
- Running tests (`pytest`)
- Code formatting (`black`, `ruff`)
- Any Python imports or scripts

**Verify environment:**
```bash
conda env list          # Check active environment (should show *)
python --version        # Should show Python 3.13.9
which python            # Should point to conda env
```

### Python (Backend)

**Environment:**
- **ALWAYS use Conda environment:** `conda activate sbk-cv-analyzer`
- **Python Version:** 3.13.9
- **Package Manager:** pip (within conda env)
- **Dependency Source:** `backend/pyproject.toml` (do not install from `backend/requirements.txt`)

**Backend dependency install rule (Copilot):**
- Always install backend dependencies from `pyproject.toml`.
- Use `pip install -e backend` from repository root (or `cd backend && pip install -e .`).
- Do not use `pip install -r backend/requirements.txt` unless explicitly requested by the user.

**Code Quality Tools:**
- **Formatter:** Black (line-length: 88)
  - Config in `backend/pyproject.toml`
  - Run: `black .` (formats all files)
- **Linter:** Ruff (comprehensive Python linter)
  - Config in `backend/pyproject.toml`
  - Run: `ruff check .` (check) or `ruff check --fix .` (auto-fix)
- **Type Checking:** Type hints required on all public interfaces
  - Use modern syntax: `str | None`, `list[str]`, `dict[str, Any]`

**Ruff Rules Enabled:**
- E/W (pycodestyle)
- F (pyflakes)
- I (isort - import sorting)
- N (pep8-naming)
- UP (pyupgrade)
- B (bugbear)
- C4 (comprehensions)
- PT (pytest-style)
- RUF (ruff-specific)
- And more (see pyproject.toml)

**Naming:**
- `snake_case` for files, functions, variables, methods
- `PascalCase` for classes
- Single underscore prefix for private: `_private_function()`

**Type Hints:**
- Required on all public interfaces
- Use modern syntax: `str | None`, `list[str]`, `dict[str, Any]`

**Import Organization:**
```python
# Standard library
import os
from pathlib import Path

# Third-party
from fastapi import FastAPI
from sqlalchemy import select

# Local
from app.core.config import settings
```

**Error Handling:**
- Specific exception types in try-except
- Functions return `tuple[None, str]` for error reporting
- Clear error messages with context

**Logging:**
- Logger per module: `logger = logging.getLogger(__name__)`
- Use appropriate levels: DEBUG, INFO, WARNING, ERROR, CRITICAL
- Structured JSON format with loguru

**Testing:**
- No dedicated test framework configured yet
- Manual verification and testing methods

**Linting & Formatting:**
```bash
# ALWAYS activate conda environment first
conda activate sbk-cv-analyzer
cd backend

# Format code with Black
black .

# Lint with Ruff
ruff check .

# Fix auto-fixable issues
ruff check --fix .

# Type check (when configured)
mypy app/
```

**Pre-commit Checks:**
Before committing Python code:
1. Activate conda environment: `conda activate sbk-cv-analyzer`
2. Run Black: `black backend/`
3. Run Ruff: `ruff check backend/`
4. Fix any linting errors
5. Verify imports work

### TypeScript/React (Frontend)

**Code Quality Tools:**
- **Linter:** ESLint 9.39.4
  - Config: `frontend/.eslintrc.json`
  - Extends: `next/core-web-vitals`, `next/typescript`
  - Run: `npm run lint`
- **Formatter:** Prettier 3.8.1
  - Run: `npx prettier --write .`
- **Type Checker:** TypeScript 5.7.0
  - Run: `npx tsc --noEmit`

**ESLint Rules:**
- Strict TypeScript checking
- React Hooks rules enforced
- No console.log (use console.warn/error only)
- Import ordering (builtin → external → internal → parent → sibling)
- Max line length: 100 characters
- Quotes: double quotes
- Semi: always required
- Indent: 2 spaces

**Conventions from UI-SPEC.md:**
- shadcn/ui components (New York style, slate base color)
- Tailwind CSS with 8-point grid (`space-4` = 16px, `space-8` = 32px)
- Inter font from `next/font/google`
- Responsive design (mobile-first)

**Naming:**
- `kebab-case` for file names: `upload-zone.tsx`
- `PascalCase` for components: `UploadZone`
- `camelCase` for functions/variables

**Linting & Formatting:**
```bash
cd frontend

# Lint with ESLint
npm run lint

# Format with Prettier
npx prettier --write .

# Type check
npx tsc --noEmit
```

**Pre-commit Checks:**
Before committing frontend code:
1. Run ESLint: `npm run lint`
2. Fix linting errors
3. Type check: `npx tsc --noEmit`
4. Build check: `npm run build`

## Environment Configuration

**Environment Variables:**
- Prefixed naming: `CV_ANALYZER_DB_HOST`, `CV_ANALYZER_REDIS_URL`
- Local: `.env` files (not committed)
- Production: Platform environment variables

**Required Services:**
- PostgreSQL 16+ (with pgvector extension)
- Redis (for Celery job queue)
- Cloudflare R2 (S3-compatible storage)

## Key Design Decisions

From `.planning/PROJECT.md` and phase contexts:

1. **Monorepo Structure** - Separate `/backend` and `/frontend` folders, existing `.agents/skills/` preserved
2. **OCR-First Strategy** - Always try OCR first for scanned PDFs, then regular extraction
3. **Async Architecture** - Redis/Celery for job queue (not BackgroundTasks), enables persistence and retry
4. **SSE Streaming** - Detailed stages: Uploading → OCR → Extracting → Validating → Complete
5. **R2 Storage** - UUID + original filename, flat structure, 24h auto-delete, presigned URLs
6. **API Design** - REST JSON, wrapped responses `{data, error, meta}`, versioned `/api/v1/`
7. **Rate Limiting** - IP-based, 5 uploads/hour, 429 responses with retry-after header
8. **Security** - Triple file validation (extension, MIME, magic bytes), ClamAV scanning, sandboxed processing
9. **No Auth v1** - Public anonymous access, focus on AI capabilities over authentication

## Working with Plans

Phase plans in `.planning/phases/{NN}-{slug}/` contain:
- `{NN}-PLAN.md` - Executable tasks with frontmatter
- `{NN}-CONTEXT.md` - User decisions from discuss-phase
- `{NN}-RESEARCH.md` - Technical research and recommendations
- `{NN}-UI-SPEC.md` - UI design contract (for frontend phases)
- `{NN}-SUMMARY.md` - Post-execution summary (created after plan completes)

**Plan Structure:**
- Frontmatter: wave, depends_on, files_modified, autonomous, requirements
- Tasks: XML format with `<read_first>`, `<action>`, `<acceptance_criteria>`
- Must-haves: truths, artifacts, key_links for verification

**Execution Flow:**
1. Executor reads plan
2. Executes tasks sequentially
3. Commits each task atomically
4. Creates SUMMARY.md
5. Updates STATE.md and ROADMAP.md

## Build & Test Commands

### Backend Commands

**IMPORTANT: Always activate conda environment first:**

```bash
# Activate environment
conda activate sbk-cv-analyzer

# Navigate to backend
cd backend

# Run development server
uvicorn app.main:app --reload

# Run database migrations
alembic upgrade head

# Run Celery worker
celery -A app.tasks.celery_app worker --loglevel=info

# Run tests (when implemented)
pytest
```

**Environment Details:**
- **Conda Environment:** `sbk-cv-analyzer`
- **Python Version:** 3.13.9
- **Package Manager:** pip (within conda env)
- **Install Command:** `pip install -e backend` (source of truth: `backend/pyproject.toml`)

**Installed Dependencies (Wave 1 & 2):**
- fastapi 0.135.2, uvicorn 0.42.0
- celery 5.6.3, redis 7.4.0
- sqlalchemy 2.0.43, psycopg 3.3.3
- pydantic 2.12.5, alembic 1.18.4
- loguru 0.7.3, boto3 1.42.83
- PyMuPDF 1.27.2.2, python-docx 1.2.0
- pdf2image 1.17.0, opencv-python 4.13.0.92
- langdetect 1.0.9
- sentry-sdk, prometheus-fastapi-instrumentator, slowapi

**Environment Variables:**
Copy `backend/.env.example` to `backend/.env` and configure:
- `CV_ANALYZER_DB_HOST` - PostgreSQL host
- `CV_ANALYZER_DB_NAME` - Database name  
- `CV_ANALYZER_REDIS_URL` - Redis connection URL
- `CV_ANALYZER_R2_ENDPOINT` - Cloudflare R2 endpoint
- `CV_ANALYZER_R2_ACCESS_KEY` - R2 access key
- `CV_ANALYZER_R2_SECRET_KEY` - R2 secret key

**Troubleshooting Backend:**
- **ModuleNotFoundError:** Ensure conda env is activated: `conda activate sbk-cv-analyzer`
- **Wrong Python version:** Deactivate all envs, then re-activate: `conda deactivate && conda activate sbk-cv-analyzer`
- **VS Code:** Select interpreter: `Ctrl+Shift+P` → "Python: Select Interpreter" → Choose `sbk-cv-analyzer`

### Frontend Commands

```bash
cd frontend

# Development server
npm run dev         # http://localhost:3000

# Production build
npm run build

# Run tests (when implemented)
npm run test

# Linting
npm run lint        # ESLint check

# Type checking
npx tsc --noEmit

# Formatting
npx prettier --write .
```

**Troubleshooting Frontend:**
- **ESLint not found:** Run `npm install` in frontend directory
- **Import errors:** Delete `node_modules` and `package-lock.json`, then `npm install`

## Important Constraints

- **Budget**: Free-tier services only (Vercel, Railway, Cloudflare R2)
- **Timeline**: Quality over speed, no hard deadline
- **Deployment**: Must be live production URL for portfolio
- **LLM APIs**: Claude/OpenAI keys available

## Quick Reference Card

### Daily Development Workflow

**Start Backend:**
```bash
# 1. Activate conda environment (ALWAYS FIRST!)
conda activate sbk-cv-analyzer

# 2. Navigate and run server
cd backend
uvicorn app.main:app --reload
# Server: http://localhost:8000
# Docs: http://localhost:8000/docs
```

**Start Frontend:**
```bash
cd frontend
npm run dev
# Server: http://localhost:3000
```

**Start Celery Worker:**
```bash
conda activate sbk-cv-analyzer
cd backend
celery -A app.tasks.celery_app worker --loglevel=info
```

### Code Quality Checks

**Before Committing Backend:**
```bash
conda activate sbk-cv-analyzer
cd backend

# 1. Format
black .

# 2. Lint
ruff check --fix .

# 3. Verify imports
python -c "from app.main import app; print('✓ OK')"
```

**Before Committing Frontend:**
```bash
cd frontend

# 1. Lint
npm run lint

# 2. Type check
npx tsc --noEmit

# 3. Build check
npm run build
```

### Database Operations

```bash
conda activate sbk-cv-analyzer
cd backend

# Create migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Check current version
alembic current
```

### Common Commands

**Check Environment:**
```bash
# Which conda env is active?
conda env list

# Which Python?
python --version  # Should be 3.13.9
which python      # Should be in conda env

# List installed packages
pip list
```

**GSD Workflow:**
```bash
# Check progress
/gsd-progress

# Execute phase
/gsd-execute-phase 1

# Execute specific wave
/gsd-execute-phase 1 --wave 2

# Execute specific plan
/gsd-execute-plan .planning/phases/01-.../01-01-PLAN.md

# List running agents
/tasks
```

**Git Workflow:**
```bash
# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "feat: description"

# View recent commits
git log --oneline -10
```

### File Structure

```
cv-analyzer/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── core/                # Config, logging, security
│   │   ├── db/                  # Database session, base
│   │   ├── models/              # SQLAlchemy models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── api/                 # API routes
│   │   ├── services/            # Business logic (storage, parser, ocr)
│   │   └── tasks/               # Celery tasks
│   ├── tests/                   # Test files
│   ├── alembic/                 # Database migrations
│   ├── pyproject.toml           # Dependencies + Black/Ruff config
│   ├── requirements.txt         # Pinned dependencies
│   └── .env.example             # Environment template
├── frontend/
│   ├── app/                     # Next.js app directory
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui components
│   │   └── upload/              # Upload-specific components
│   ├── lib/                     # Utilities and types
│   ├── hooks/                   # Custom React hooks
│   ├── .eslintrc.json           # ESLint config
│   ├── tailwind.config.ts       # Tailwind config
│   └── package.json             # Dependencies
├── .github/
│   └── copilot-instructions.md  # This file - project guide
├── .gitignore                   # Git ignore patterns
└── .planning/                   # GSD workflow (not committed)
    ├── PROJECT.md               # Project definition
    ├── ROADMAP.md               # Phase breakdown
    ├── STATE.md                 # Current position
    ├── REQUIREMENTS.md          # All requirements
    └── phases/                  # Phase plans
```

### Configuration Files

| File | Purpose |
|------|---------|
| `backend/pyproject.toml` | Python dependencies, Black config, Ruff config |
| `backend/requirements.txt` | Pinned Python dependencies |
| `backend/.env` | Environment variables (NOT committed) |
| `backend/alembic.ini` | Database migration config |
| `frontend/.eslintrc.json` | ESLint rules (relaxed for shadcn/ui) |
| `frontend/package.json` | Node dependencies |
| `frontend/tsconfig.json` | TypeScript config |
| `frontend/tailwind.config.ts` | Tailwind CSS config |
| `.gitignore` | Files to ignore in git |
| `.github/copilot-instructions.md` | Project conventions and rules (this file) |

### Common Issues & Solutions

**Backend:**
- **"ModuleNotFoundError"** → Activate conda: `conda activate sbk-cv-analyzer`
- **Wrong Python version** → `conda deactivate && conda activate sbk-cv-analyzer`
- **Black/Ruff not found** → `pip install black ruff` (in conda env)
- **Import errors** → Verify conda env, reinstall package with pip

**Frontend:**
- **"ESLint not found"** → Run `npm install` in frontend/
- **Build errors** → Delete `node_modules/` and `.next/`, then `npm install`
- **Type errors** → Run `npx tsc --noEmit` to see all errors

**Database:**
- **Connection errors** → Check PostgreSQL is running, verify .env credentials
- **Migration errors** → Check alembic current version, review migration file

**General:**
- **"Planning files not found"** → `.planning/` is gitignored, only exists locally after GSD commands
- **Linting failures** → Run auto-fix first: `black .` and `ruff check --fix .`

## File Organization

**Do NOT commit:**
- `.planning/` - GSD workflow artifacts
- `.agents/`, `.claude/` - AI agent files
- `tests/` - Test files
- `node_modules/`, `.next/` - Build artifacts
- `.env*` - Environment files

**DO commit:**
- `backend/`, `frontend/` - Application code
- `README.md` - Project documentation
- `requirements.txt`, `package.json` - Dependencies
- `.github/` - GitHub configuration
