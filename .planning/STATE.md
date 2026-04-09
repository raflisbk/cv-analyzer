---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
current_phase: 05
status: unknown
last_updated: "2026-04-09T09:17:24.748Z"
progress:
  total_phases: 5
  completed_phases: 3
  total_plans: 37
  completed_plans: 27
---

# Project State: CV Analyzer

**Created:** 2026-04-03
**Current Phase:** 05
**Current Focus:** Phase 04 — streaming-comparison (gap closure round 2)

## Project Reference

**Core Value:** Demonstrate AI Engineer mastery through production-ready CV analysis

**What This Is:**
A web-based CV/resume analyzer application that provides multi-dimensional scoring, improvement suggestions, and job role comparison. Built as a portfolio project to demonstrate AI Engineer mastery through production-ready architecture and modern AI capabilities.

**Target Audience:**

- Primary: Recruiters and hiring managers evaluating AI Engineer candidates
- Secondary: Job seekers wanting to improve their CVs

**AI Capabilities to Showcase:**

1. LLM Integration — Semantic understanding, reasoning, prompt engineering, structured output
2. NLP Techniques — Text extraction, skill recognition, entity matching, keyword analysis
3. RAG Architecture — Vector embeddings, semantic search, knowledge retrieval
4. AI Engineering Patterns — Async processing, streaming responses, evaluation metrics

## Current Position

**Current Plan:** 18
**Total Plans in Phase:** 18
**Status:** Ready to execute
**Last Activity:** 2026-04-09
**Progress:** [███████░░░] 74%

Phase: 04 (streaming-comparison (gap closure round 2)) — EXECUTING
Plan: Not started
**Phase:** 2 - Basic Analysis Engine
**All Plans Complete:** 02-01 ✅ | 02-02 ✅ | 02-03 ✅ | 02-04 ✅ | 02-05 ✅ | 02-06 ✅
**UAT:** 10/10 tests passed ✅

**Progress Bar:** ▰▰▰▰▰▰▰▰▰▰ 100% (6/6 plans complete in Phase 2)

**Phase 2 Achievements:**

- ✅ Section detection: header, summary, experience, education, skills, certifications
- ✅ Skill extraction: curated whitelist (~150 tech skills), n-gram sliding window, no ESCO noise
- ✅ CV scoring: rule-based fallback (action verbs, quantified achievements, section coverage)
- ✅ Grammar checking: LanguageTool integration with graceful Java degradation
- ✅ ATS checks: formatting validation, section presence, keyword detection
- ✅ Results page: 4 tabs (Overview, Scores, Skills, Grammar) with animated gauge charts
- ✅ Real-time SSE stages: uploading → extracting → analyzing → complete
- ✅ Rate limiting: slowapi IP-based, 5 uploads/hour
- ✅ Windows fixes: Celery --pool=solo, SelectorEventLoop, react-dropzone 15

## Performance Metrics

**Quality Metrics:**

- Requirements validated: 17/17 Phase 2 requirements
- All 10 UAT tests passed: 2026-04-06
- Known limitations: scoring is rule-based (Phase 3 will add LLM/embedding scoring)

## Accumulated Context

### Key Decisions

### Decisions Made

| Decision | Rationale | Outcome |
| -------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------- |
| FastAPI backend | Python async framework, ideal for AI/ML apps | ✅ Implemented |
| Next.js frontend | Modern React framework, App Router, server components | ✅ Implemented |
| shadcn/ui UI library | Popular 2025, Tailwind-based, impressive for portfolio | ✅ Implemented |
| PostgreSQL + pgvector | Single DB for relational + vector storage, production-ready | ✅ Schema ready |
| Celery --pool=solo on Windows | prefork uses spawn which crashes on Windows | ✅ Runtime flag |
| asyncio.WindowsSelectorEventLoopPolicy | psycopg requires SelectorEventLoop | ✅ Set in celery_app.py |
| Curated skill whitelist over ESCO | ESCO 14K entries span all industries → false positives | ✅ ~150 curated skills |
| Rule-based scoring fallback | No OpenAI key in Phase 2; Phase 3 adds LLM scoring | ✅ scoring_method field |
| react-dropzone 15.0.0 | v14 incompatible with React 19 event delegation | ✅ Upgraded |
| Phase 04 P01 | 20 | 2 tasks | 5 files |
| Phase 04 P00 | 35 | 2 tasks | 7 files |
| Phase 04-streaming-comparison P04 | 15min | 2 tasks | 4 files |
| Phase 04-streaming-comparison P02 | 15 | 2 tasks | 5 files |
| Phase 04-streaming-comparison P03 | 25m | 2 tasks | 4 files |
| Phase 04-streaming-comparison P05 | 10m | 2 tasks | 4 files |
| Phase 04-streaming-comparison P06 | 15 | 2 tasks | 4 files |
| Phase 04-streaming-comparison P07 | 1775666259s | 1 tasks | 1 files |
| Phase 04 P08 | 109 | 1 tasks | 0 files |
| Phase 04-streaming-comparison P04-09 | 2 minutes | 1 tasks | 1 files |
| Phase 04 P10 | 140 | 4 tasks | 4 files |
| Phase 04 P12 | 62 | 2 tasks | 1 files |
| Phase 04-streaming-comparison P13 | 62 | 1 tasks | 1 files |
| Phase 04 P14 | 1775723207 | 2 tasks | 3 files |
| Phase 04 P14 | 480 | 2 tasks | 3 files |
| Phase 04 P15 | 555 | 2 tasks | 1 files |
| Phase 04 P16 | 11 min | 3 tasks | 4 files |
- [Phase 04]: Replaced fallback export error PDF with structured JSON error contract to prevent double-failure render paths.
- [Phase 04]: Pinned WeasyPrint to 61.2 in both pyproject and requirements to match runtime and eliminate install drift.
| Phase 04 P17 | 8 min | 3 tasks | 5 files |
- [Phase 04]: Normalize suggestion keys at results boundary before rendering components
- [Phase 04]: Copy Suggestions now exports all visible items grouped by section in stable order

### Architecture Approach

**Major Components:**

1. **Document Parser** ✅ — Extract text from PDF/DOC, handle OCR, normalize formatting
2. **Analysis Orchestrator** ✅ — Coordinate async pipeline stages, manage progress streaming
3. **NLP Service** ✅ — Skill extraction, section detection, entity recognition
4. **Scoring Service** ✅ — Rule-based multi-dimensional scoring (Phase 3: LLM scoring)
5. **Grammar Service** ✅ — LanguageTool integration with graceful degradation
6. **LLM Service** — Semantic analysis, scoring, suggestion generation (Phase 3)
7. **Vector Store** — Semantic search for RAG retrieval (Phase 3)

### Active Todos

**Immediate:**

- Plan and execute Phase 03 (AI Intelligence Layer)
  - LLM integration (Claude/OpenAI) for semantic scoring
  - Structured output with validation
  - Cost controls (token tracking, rate limits, caching)
  - RAG with pgvector for best practices retrieval

### Blockers

- OpenAI/Claude API key needed for Phase 3 LLM integration

### Session Continuity

**Last Session:** 2026-04-09T15:28:38.071Z
**Phase 2 completed:** 2026-04-06

**Next Actions:**

1. Run `/gsd-discuss-phase 3` to gather Phase 3 context
2. Run `/gsd-plan-phase 3` to create execution plans
3. Run `/gsd-execute-phase 3` to implement AI Intelligence Layer

## Technical Stack

**Backend:**

- ✅ FastAPI 0.135.2 + Uvicorn 0.42.0
- ✅ SQLAlchemy 2.0.43 + psycopg 3.3.3 (async PostgreSQL)
- ✅ Celery 5.6.3 + Redis 7.4.0 (async job queue)
- ✅ spaCy en_core_web_lg (NLP pipeline)
- ✅ PyMuPDF 1.27.2 + python-docx 1.2.0 (document parsing)
- ✅ Loguru 0.7.3 (structured JSON logging)
- ✅ slowapi (rate limiting)
- ⏳ Claude/OpenAI APIs (Phase 3)
- ⏳ pgvector (Phase 3)

**Frontend:**

- ✅ Next.js 15 + React 19
- ✅ shadcn/ui + Tailwind CSS
- ✅ react-dropzone 15.0.0
- ✅ SSE hooks with auto-reconnect
- ✅ Animated gauge charts (@visx)
- ✅ Results page with 4 tabs

**Infrastructure:**

- ✅ Docker Compose (PostgreSQL + Redis local dev)
- ⏳ Cloudflare R2 (Phase 3+)
- ⏳ Vercel + Railway deployment (Phase 5)

## Deployment Targets

**Production URL:** TBD (after Phase 4 completion)
**Portfolio Demo:** Live production URL showcasing all AI capabilities

---

*State updated: 2026-04-06 — Phase 2 complete*

## Project Reference

**Core Value:** Demonstrate AI Engineer mastery through production-ready CV analysis

**What This Is:**
A web-based CV/resume analyzer application that provides multi-dimensional scoring, improvement suggestions, and job role comparison. Built as a portfolio project to demonstrate AI Engineer mastery through production-ready architecture and modern AI capabilities.

**Target Audience:**

- Primary: Recruiters and hiring managers evaluating AI Engineer candidates
- Secondary: Job seekers wanting to improve their CVs

**AI Capabilities to Showcase:**

1. LLM Integration — Semantic understanding, reasoning, prompt engineering, structured output
2. NLP Techniques — Text extraction, skill recognition, entity matching, keyword analysis
3. RAG Architecture — Vector embeddings, semantic search, knowledge retrieval
4. AI Engineering Patterns — Async processing, streaming responses, evaluation metrics

## Current Position

Phase: 01 (foundation-document-pipeline) — **COMPLETE** ✅
**Phase:** 1 - Foundation & Document Pipeline
**All Waves Complete:** Wave 1 ✅ | Wave 2 ✅ | Wave 3 ✅ | Wave 4 ✅
**Plans Completed:** 01-01, 01-02, 01-03, 01-04, 01-05 (all 5/5)

**Progress Bar:** ▰▰▰▰▰ 100% (5/5 plans complete in Phase 1)

**Wave 4 Achievements:**

- ✅ Upload UI: Drag-drop zone + file picker (react-dropzone)
- ✅ SSE hooks: Real-time progress streaming with auto-reconnect
- ✅ Processing stages: 4-stage indicator (uploading → extracting → validating → complete)
- ✅ State machine: Full upload flow (zone → preview → processing → complete/failed)
- ✅ Toast notifications: sonner integration for errors and status
- ✅ Local dev infra: Docker Compose (PostgreSQL + Redis) + Alembic migration

## Performance Metrics

**Planning Metrics:**

- Requirements defined: 47 v1 requirements
- Requirements mapped: 47/47 (100% coverage)
- Phases identified: 5 phases
- Current phase: 1
- Plans completed in Phase 1: 4/5 (01-01, 01-02, 01-03, 01-04 complete)

**Quality Metrics:**

- Requirements validated: 0/47
- Requirements completed: 9/47 (UPLOAD-01, UPLOAD-02, UPLOAD-03, UPLOAD-04, UPLOAD-05, UPLOAD-06, UPLOAD-07, ERROR-01, ERROR-05 satisfied)
- Plans completed: 3/5 in Phase 1 (01-01, 01-02, 01-03 complete)

**Execution Metrics:**

- Plan 01-01 duration: 26.4 minutes
- Plan 01-01 tasks: 4/4 completed
- Plan 01-01 files created: 15
- Plan 01-01 commits: 5
- Plan 01-02 duration: 25 minutes
- Plan 01-02 tasks: 3/3 completed
- Plan 01-02 files created: 18
- Plan 01-02 commits: 3

## Accumulated Context

### Key Decisions

| Decision                         | Rationale                                                   | Outcome                                                         |
| -------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------------- |
| FastAPI backend                  | Python async framework, ideal for AI/ML apps                | ✅**Implemented in 01-01**                                |
| Next.js frontend                 | Modern React framework, App Router, server components       | ✅**Implemented in 01-02**                                |
| shadcn/ui UI library             | Popular 2025, Tailwind-based, impressive for portfolio      | ✅**Implemented in 01-02** (New York style, slate colors) |
| PostgreSQL + pgvector            | Single DB for relational + vector storage, production-ready | ✅**Schema ready in 01-01** (migration pending)          |
| Cloudflare R2 storage            | S3-compatible, free tier, no egress fees                    | Pending implementation                                          |
| Vercel + Railway deployment      | Separate frontend/backend, impressive architecture          | Pending implementation                                          |
| Streaming SSE responses          | Shows async communication knowledge, better UX              | Pending implementation                                          |
| No authentication v1             | Simpler for portfolio, focus on AI capabilities             | Pending implementation                                          |
| 8-point grid spacing             | Consistent vertical rhythm, professional polish             | ✅**Implemented in 01-02**                                |
| Inter font typography            | Excellent screen rendering, modern professional tone        | ✅**Implemented in 01-02**                                |
| React Query for state            | Industry standard for server state, better UX               | ✅**Implemented in 01-02**                                |
| file_metadata column (not metadata) | SQLAlchemy reserves `metadata` attribute name            | ✅**Implemented in 01-01** (auto-fix deviation)          |
| datetime.now(UTC) API            | Modern timezone-aware timestamps, deprecates utcnow()       | ✅**Implemented in 01-01** (linting fix)                 |
| Phase 01 P01 | 26.4 | 4 tasks | 15 files |
| Phase 01 P03 | 29.8 | 2 tasks | 6 files |

### Architecture Approach

**Major Components:**

1. **Document Parser** — Extract text from PDF/DOC, handle OCR, normalize formatting
2. **Analysis Orchestrator** — Coordinate async pipeline stages, manage progress streaming
3. **LLM Service** — Semantic analysis, scoring, suggestion generation
4. **NLP Service** — Skill extraction, entity recognition, keyword matching
5. **Vector Store** — Semantic search for RAG retrieval (pgvector)
6. **Streaming Endpoint** — Real-time progress via Server-Sent Events

**Data Flow:** Upload → R2 storage → Background task → Parser → NLP extraction → LLM analysis → SSE streaming → Results display

### Critical Pitfalls to Avoid

1. **Brittleness to CV Format Variations** — Build diverse CV test corpus early, implement defensive parsing with fallbacks
2. **LLM Hallucination in Analysis** — Use structured outputs, anchor responses to extracted data, implement validation
3. **Ignoring PDF/Document Extraction Quality** — Add extraction quality checks early, implement graceful degradation
4. **Synchronous Processing Blocking UI** — Implement async processing from day one, never block HTTP on LLM call
5. **No Cost Control for LLM Usage** — Track token usage, cache results, rate limit per IP, set budget limits

### Active Todos

**Immediate:**

- Execute Plan 01-03 (Document Parsing - Wave 2)
- Execute Plan 01-04 (Real-time Progress - Wave 2)
- Execute Plan 01-05 (Storage & Cleanup - Wave 2)
- Set up local PostgreSQL database and run Alembic migrations

**Upcoming:**

- Complete Phase 1 Wave 2 plans (01-03, 01-04, 01-05)
- Begin Phase 2 planning after Phase 1 completion
- Test end-to-end CV upload → parsing → analysis flow

### Blockers

None identified.

### Session Continuity

**Last Session:** 2026-04-04T17:18:42.213Z
**Current Session:** 2026-04-04T12:02:46Z (Completed 01-01-PLAN.md - Backend Foundation)

**Context Handoff:**

- ✅ Plan 01-02 (Frontend Foundation) completed successfully (previous session)
- ✅ Plan 01-01 (Backend Foundation) completed successfully (current session)
- Frontend ready with Next.js 15, shadcn/ui, Tailwind CSS, React Query
- Backend ready with FastAPI, PostgreSQL models, structured logging, file validation
- Wave 1 complete: Both frontend and backend foundations established
- 5 backend commits made (structure, config/logging, models, linting, security)
- 15 backend files created, all imports verified, server tested
- Ready for Wave 2: Document parsing, real-time progress, storage integration

**Next Actions:**

1. Set up local PostgreSQL database: `createdb cv_analyzer`
2. Run Alembic migrations: `cd backend && alembic revision --autogenerate -m "Create jobs table" && alembic upgrade head`
3. Execute Plan 01-03 (Document Parsing - depends on 01-01)
4. Execute Plan 01-04 (Real-time Progress - depends on 01-01)
5. Execute Plan 01-05 (Storage & Cleanup - depends on 01-01)

## Technical Stack

**Backend:**

- ✅ FastAPI 0.115.0 (Python 3.13, async web framework) - **Implemented**
- ✅ SQLAlchemy 2.0.30 + psycopg 3.2.0 (async PostgreSQL) - **Implemented**
- PostgreSQL 16 + pgvector (vector storage pending)
- Anthropic Claude API + LangChain (pending)
- spaCy + scikit-learn (pending)
- ✅ PyMuPDF 1.24.0 + python-docx 1.1.0 (dependencies ready) - **Installed**
- ✅ Loguru 0.7.2 (structured JSON logging) - **Implemented**
- ✅ Sentry SDK 2.18.0 + Prometheus (monitoring) - **Implemented**

**Frontend:**

- ✅ Next.js 15 + React 19 - **Implemented**
- ✅ shadcn/ui + Tailwind CSS - **Implemented**
- Server-Sent Events (SSE) (pending)

**Infrastructure:**

- Cloudflare R2 (file storage)
- Vercel (frontend deployment)
- Railway (backend deployment)

## Deployment Targets

**Production URL:** TBD (after Phase 4 completion)
**Portfolio Demo:** Live production URL showcasing all AI capabilities

---

*State created: 2026-04-03*
*Next update: After Phase 1 completion*
