# Project State: CV Analyzer

**Created:** 2026-04-03
**Current Phase:** Phase 1
**Current Focus:** Foundation & Document Pipeline

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

**Phase:** 1 - Foundation & Document Pipeline
**Plan:** Not started
**Status:** Init complete, ready to begin Phase 1 planning

**Progress Bar:** ▱▱▱▱▱ 0% (0/5 phases complete)

## Performance Metrics

**Planning Metrics:**
- Requirements defined: 47 v1 requirements
- Requirements mapped: 47/47 (100% coverage)
- Phases identified: 5 phases
- Current phase: 1

**Quality Metrics:**
- Requirements validated: 0/47
- Requirements completed: 0/47
- Plans completed: 0/5 phases

## Accumulated Context

### Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| FastAPI backend | Python async framework, ideal for AI/ML apps | Pending implementation |
| Next.js frontend | Modern React framework, App Router, server components | Pending implementation |
| shadcn/ui UI library | Popular 2025, Tailwind-based, impressive for portfolio | Pending implementation |
| PostgreSQL + pgvector | Single DB for relational + vector storage, production-ready | Pending implementation |
| Cloudflare R2 storage | S3-compatible, free tier, no egress fees | Pending implementation |
| Vercel + Railway deployment | Separate frontend/backend, impressive architecture | Pending implementation |
| Streaming SSE responses | Shows async communication knowledge, better UX | Pending implementation |
| No authentication v1 | Simpler for portfolio, focus on AI capabilities | Pending implementation |

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
- Begin Phase 1 planning with `/gsd:plan-phase 1`
- Research document parsing edge cases (international formats, ATS CVs)
- Build diverse CV test corpus (20+ variations)

**Upcoming:**
- Plan Phase 2: Basic Analysis Engine
- Plan Phase 3: AI Intelligence Layer
- Plan Phase 4: Streaming & Comparison
- Evaluate need for Phase 5: Advanced Features

### Blockers

None identified.

### Session Continuity

**Last Session:** 2026-04-03 (Initial roadmap creation)
**Current Session:** 2026-04-03 (Ready to begin Phase 1 planning)

**Context Handoff:**
- Roadmap created with 5 phases derived from 47 v1 requirements
- Research recommendations incorporated into phase structure
- All requirements mapped with 100% coverage
- Ready to begin Phase 1 planning: Foundation & Document Pipeline

**Next Actions:**
1. Run `/gsd:plan-phase 1` to create detailed Phase 1 plan
2. Research document parsing edge cases during Phase 1 planning
3. Build CV test corpus to validate parsing robustness

## Technical Stack

**Backend:**
- FastAPI (Python 3.11+)
- PostgreSQL 16 + pgvector
- Anthropic Claude API + LangChain
- spaCy + scikit-learn
- PyMuPDF + python-docx

**Frontend:**
- Next.js 15 + React 19
- shadcn/ui + Tailwind CSS
- Server-Sent Events (SSE)

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
