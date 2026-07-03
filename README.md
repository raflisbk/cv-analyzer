# CV Analyzer — PathKarir

> AI-powered CV/resume analyzer with multi-dimensional scoring, LLM suggestions, job description comparison, and an agentic workspace editor. Built as a portfolio project demonstrating production-grade AI engineering.

**Version:** `0.1.0` · **Scoring Algorithm:** `v5` · **Archetypes:** `1088` across `31` Indonesian domains

---

## Features

| Feature | Description |
|---|---|
| **Multi-dimensional Scoring** | 4 axes — Impact (35%), Clarity (30%), Relevance (20%), Completeness (15%) — via LLM ensemble |
| **Deterministic Metrics** | Rule-based objective score: quantified bullets, action verbs, passive voice, section coverage, employment gaps |
| **Archetype Detection** | 1088 role archetypes across 31 Indonesian labor market domains (2-tier LLM detection) |
| **JD Comparison** | Upload a job description → gap analysis, skill match %, red flag detection |
| **Grammar Check** | LLM-based grammar/spelling checker with issue count badge |
| **Workspace Editor** | Tiptap v3 rich-text editor + PDF viewer + Y.js CRDT (real-time sync) |
| **AI Chat** | Context-aware chat about your CV scores and suggestions (SSE streaming) |
| **OCR Support** | Granite Vision 4.1 → EasyOCR fallback for scanned PDFs and images |
| **Auth** | Google OAuth + JWT; anonymous uploads supported |
| **Export** | PDF export via WeasyPrint |
| **ATS Check** | 15+ ATS compatibility rules (file format, keywords, formatting) |
| **Version Delta** | Track score changes across CV re-uploads (parent_job_id chain) |

---

## Scoring Version History

| Version | Date | Change |
|---|---|---|
| `v1` | Phase 2 | Embedding-anchor cosine similarity; static anchor phrases per dimension |
| `v2` | Phase 5 | K=2 top-anchor mean; role-specific anchors; dynamic LLM anchor generation |
| `v3` | 2026-06-20 | Full LLM-based scorer (no anchors); 4 dimensions in single call; per-role calibration |
| `v4` | 2026-06-21 | Deterministic metrics overlay; ensemble scoring (median N runs); version delta; Redis cache |
| `v5` | 2026-06-21 | Archetype-aware impact guidance (31 domains); archetype-aware section expectations; 58 Indonesian strong verbs; ensemble default → 3 |

---

## Architecture

```
Upload (PDF/DOCX/Image)
  │
  ▼
Cloudflare R2 Storage
  │
  ▼
Celery Task Chain (5 stages)
  ├── process_document_task   → text extraction (PyMuPDF / python-docx / OCR)
  ├── nlp_analysis_task       → spaCy NLP (sections, entities, skills, role detect, archetype)
  ├── scoring_task            → LLM ensemble scoring + deterministic metrics + ATS
  ├── grammar_check_task      → LLM grammar/spelling check
  └── llm_suggest_task        → suggestion cards + writes cv_document → COMPLETE
        │
        ▼
Redis pub/sub  ──────────────►  SSE stream /api/v1/stream/{job_id}
        │                               │
        ▼                               ▼
PostgreSQL (pgvector)           Frontend progress bar
  │
  ▼
Results API /api/v1/results/{job_id}
  │
  ▼
Frontend: /results/{job_id} + /workspace-v2/{job_id}
```

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Framework | FastAPI 0.115 + Python 3.13 |
| Database | PostgreSQL 16 + pgvector (RAG embeddings) |
| Task Queue | Celery 5.4 + Redis 5.0 |
| Storage | Cloudflare R2 (boto3 presigned URLs) |
| NLP | spaCy 3.7 (section detection, skill extraction, entity recognition) |
| LLM / Embeddings | KoboiLLM (OpenAI-compatible API, `gpt-5.1` + `text-embedding-3-large`) |
| OCR | Granite Vision 4.1 via Replicate → EasyOCR fallback |
| PDF Export | WeasyPrint 60.0 + Jinja2 |
| Auth | Google OAuth 2.0 + JWT (python-jose) |
| CRDT | pycrdt-websocket (Y.js server) |

### Frontend
| Layer | Technology |
|---|---|
| Framework | Next.js 15 + React 19 + TypeScript |
| UI | shadcn/ui (New York) + Tailwind CSS + Mathical design system |
| Editor | Tiptap v3 + Y.js (y-websocket) |
| State | Zustand |
| PDF Viewer | react-pdf (PDF.js) |
| Testing | Vitest + Playwright (E2E) |

---

## Project Structure

```
cv-analyzer/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/   # FastAPI route handlers
│   │   ├── core/               # config.py, auth.py, security.py
│   │   ├── models/             # SQLAlchemy ORM (Job, User, KnowledgeChunk)
│   │   ├── schemas/            # Pydantic request/response schemas
│   │   ├── services/
│   │   │   ├── scoring/        # llm_scorer.py, deterministic_metrics.py, scorer.py
│   │   │   ├── llm/            # koboi_llm_service.py, archetype_detector.py, jd_analyzer.py
│   │   │   ├── nlp/            # section_detector.py, skill_extractor.py, entity_extractor.py
│   │   │   ├── rag/            # retriever.py, chunker.py, embeddings.py
│   │   │   ├── grammar/        # checker.py (LLM-based)
│   │   │   └── ats/            # checker.py (rule-based)
│   │   └── tasks/              # Celery task chain (5 files)
│   ├── alembic/                # Database migrations
│   ├── tests/                  # pytest test suite (111 tests)
│   └── pyproject.toml          # Source of truth for dependencies
└── frontend/
    ├── app/                    # Next.js App Router pages
    ├── components/
    │   ├── results/            # ScoreDashboard, MetricsPanel, GrammarIssuesList, etc.
    │   ├── workspace-v2/       # Shell, ChatPanel, PdfViewer, RichTextEditor
    │   └── landing/            # Hero, Features, HowItWorks
    ├── hooks/                  # useJobStream, useChatStream, useDraftSave, etc.
    └── lib/                    # types.ts, api.ts, stores/
```

---

## Quick Start

### Prerequisites
- Python 3.13 (Conda recommended)
- Node.js 20+
- PostgreSQL 16 with pgvector extension
- Redis 7+

### Backend

```bash
# 1. Create conda environment
conda create -n sbk-cv-analyzer python=3.13
conda activate sbk-cv-analyzer

# 2. Install dependencies (pyproject.toml is source of truth)
pip install -e backend

# 3. Install spaCy model
python -m spacy download en_core_web_lg

# 4. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials

# 5. Apply database migrations
cd backend && alembic upgrade head

# 6. Start backend (Windows: use run.py, not uvicorn directly)
python run.py

# 7. Start Celery worker (separate terminal)
conda activate sbk-cv-analyzer
cd backend
celery -A app.tasks.celery_app worker --loglevel=info --pool=solo
```

### Frontend

```bash
cd frontend
npm ci
npm run dev
```

Access:
- Frontend: `http://localhost:3000`
- API docs: `http://localhost:8000/docs`

---

## Environment Variables

All variables use the `CV_ANALYZER_` prefix. Key ones:

```bash
# AI (required)
CV_ANALYZER_KOBOI_API_KEY=        # KoboiLLM API key
CV_ANALYZER_KOBOI_BASE_URL=https://lite.koboillm.com/v1
CV_ANALYZER_LLM_MODEL=openai/gpt-5.1
CV_ANALYZER_EMBEDDING_MODEL=openai/text-embedding-3-large

# Storage (required for file uploads)
CV_ANALYZER_R2_ENDPOINT=
CV_ANALYZER_R2_ACCESS_KEY=
CV_ANALYZER_R2_SECRET_KEY=

# Auth (required for Google login)
CV_ANALYZER_GOOGLE_CLIENT_ID=
CV_ANALYZER_JWT_SECRET=           # min 32 chars in production

# Scoring tuning (optional)
CV_ANALYZER_SCORING_ENSEMBLE_RUNS=3   # LLM calls per score; median taken
CV_ANALYZER_LLM_CACHE_TTL=86400       # Score cache TTL in seconds

# OCR (optional)
CV_ANALYZER_REPLICATE_API_TOKEN=      # Granite Vision fallback OCR
```

See `backend/.env.example` for the full list.

---

## API Reference

All endpoints under `/api/v1/`:

| Method | Path | Description |
|---|---|---|
| `POST` | `/upload` | Upload CV (PDF/DOCX/image), returns `job_id` |
| `GET` | `/stream/{job_id}` | SSE stream for real-time analysis progress |
| `GET` | `/jobs/{job_id}` | Job metadata + status |
| `GET` | `/results/{job_id}` | Full analysis result (scores, suggestions, grammar) |
| `POST` | `/compare/{job_id}` | Compare CV against a job description |
| `GET` | `/workspace/{job_id}` | Workspace hydration (editor content + anchors) |
| `PUT` | `/workspace/{job_id}/draft` | Save draft content |
| `POST` | `/inline-edit` | Rewrite CV text via LLM |
| `POST` | `/chat/{job_id}` | SSE streaming chat about the CV |
| `GET` | `/export/{job_id}/pdf` | Export analyzed CV as PDF |
| `GET` | `/job-roles` | List supported job roles |
| `POST` | `/auth/google` | Google OAuth token exchange |

---

## CI/CD

GitHub Actions workflow (`.github/workflows/pr-quality-gate.yml`):

- **Trigger:** push to `dev`, PR to `main`
- **Steps:** Black format check → Ruff lint → Pytest (111 tests) → ESLint → Next.js build
- **Python:** 3.13 · **Node:** 20 · **Package manager:** uv (fast installs)

---

## Development Commands

```bash
# Backend quality checks
conda activate sbk-cv-analyzer
cd backend
black .              # format
ruff check --fix .   # lint + autofix
pytest               # all 111 tests

# Frontend quality checks
cd frontend
npm run lint         # ESLint
npx tsc --noEmit     # type check
npm run test         # Vitest unit tests
npm run build        # production build check
```

---

## Key Design Decisions

1. **KoboiLLM over direct OpenAI** — same OpenAI-compatible API for both LLM completions and embeddings via single base URL + key
2. **LLM-based scoring over embedding similarity** — more nuanced; handles any role without pre-computed anchors; degrades gracefully (fallback score=50)
3. **Ensemble scoring** — N=3 LLM calls, median per dimension; reduces variance from LLM non-determinism
4. **2-tier archetype detection** — domain classification first (30 choices), then archetype within domain (up to 79 choices); more accurate than single 1000-item prompt
5. **Celery `--pool=solo`** — required on Windows; prefork uses spawn which crashes
6. **`pyproject.toml` as dependency source** — `requirements.txt` for tooling compat only
7. **`asyncio.WindowsSelectorEventLoopPolicy`** — psycopg requires SelectorEventLoop; set in `celery_app.py` and `run.py`
8. **Grammar via LLM** — LanguageTool replaced; KoboiLLM returns structured JSON `{text, offset, suggestion, rule}`
9. **Y.js for CRDT** — pycrdt-websocket backend + y-websocket frontend; room scoping by URL path `/yjs/{job_id}`
