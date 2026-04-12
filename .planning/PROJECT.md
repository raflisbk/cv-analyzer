# CV Analyzer

## What This Is

A web-based CV/resume analyzer application that provides multi-dimensional scoring, improvement suggestions, and job role comparison. Built as a portfolio project to demonstrate AI Engineer mastery through production-ready architecture and modern AI capabilities.

Users upload CV files (PDF/DOC), receive comprehensive analysis including completeness scores, impact metrics, skill gaps, and actionable improvement recommendations. The application also compares CVs against job descriptions to identify matching strengths and weaknesses.

## Core Value

**Demonstrate AI Engineer mastery** — Every technical decision prioritizes showcasing deep understanding of modern AI engineering, from LLM integration and RAG architecture to production deployment and real-time streaming.

## Requirements

### Validated

**Validated in Phase 1 (Foundation & Document Pipeline):**
- [x] File upload: PDF/DOC parsing with OCR fallback
- [x] Public access (no authentication required)
- [x] Cloudflare R2 storage with 24-hour retention

**Validated in Phase 2 (Basic Analysis Engine):**
- [x] Multi-dimensional scoring: completeness, impact, clarity, keyword relevance
- [x] NLP techniques: skill extraction, entity recognition
- [x] Missing content alerts: skills, experiences, achievements
- [x] Format improvements: structure, layout, section balance

**Validated in Phase 3 (AI Intelligence Layer):**
- [x] LLM-based semantic analysis with OpenAI gpt-4o-mini
- [x] Improvement suggestions: action verbs, metrics, formatting
- [x] RAG with vector database (pgvector) for knowledge retrieval
- [x] Cost-controlled LLM integration (token tracking, Redis caching)

**Validated in Phase 4 (Streaming & Comparison):**
- [x] Real-time streaming analysis progress (SSE)
- [x] Role comparison: match CV against job descriptions
- [x] PDF export with WeasyPrint
- [x] Before/After suggestion display

### Active

- [ ] **WORKSPACE-08**: PDF-first workspace replaces text editor canvas with original PDF as immutable visual source
- [ ] **WORKSPACE-09**: Workspace has 3-panel layout: left detail panel, center PDF viewer, right summary rail + chat
- [ ] **WORKSPACE-10**: Optimized preview is default; Diff toggle switches to original uploaded PDF (single-view toggle)
- [ ] **WORKSPACE-11**: AI suggestions rendered as stabilo anchors on the PDF optimized view
- [ ] **WORKSPACE-12**: Hovering suggestion anchor for ~1.5s shows Apply/Dismiss popover; hover sinkron ke panel kiri
- [ ] **WORKSPACE-13**: User can select text in PDF preview → inline "Edit with AI" popover → write prompt → preview/apply rewrite
- [ ] **WORKSPACE-14**: Live contextual chat acts as CV optimization copilot (context-aware of scores, suggestions, grammar, edits)
- [ ] **WORKSPACE-15**: Sticky footer action bar (Apply, Diff, Save optimized PDF, Save report) always visible
- [ ] **WORKSPACE-16**: Save optimized PDF exports edited CV as downloadable PDF
- [ ] **WORKSPACE-17**: Save report exports analysis summary as downloadable PDF
- [ ] **WORKSPACE-18**: Real-time collaboration foundation using Yjs CRDT + WebSocket (future-ready, not necessarily multi-user in v4.0)
- [ ] **WORKSPACE-19**: Job match data/architecture preserved safely; not exposed in v4.0 workspace UX

### Validated (from v1.0–v3.0)

- [x] **WORKSPACE-01**: Upload → workspace redirect (Phase 11)
- [x] **WORKSPACE-02**: CV parsed to editable sections (Phase 12)
- [x] **WORKSPACE-03**: Section editing + formatting (Phase 12)

## Current Milestone: v4.0 — PDF-First Analysis Workspace

**Goal:** Bangun ulang workspace CV Analyzer menjadi single PDF-first workspace dengan AI suggestions actionable, inline editing, live contextual chat, dan fondasi real-time CRDT/WebSocket yang siap untuk collaborative editing.

**Target features:**
- 3-panel layout: detail kiri (tabs: Overview, Scores, Suggestions, Grammar, Skills) + PDF center + summary rail + live chat kanan
- PDF viewer default ke optimized; Diff toggle → original uploaded PDF (single-view, bukan split)
- Stabilo anchors pada PDF untuk AI suggestions (pink/orange/lime by type)
- Hover suggestion 1.5s → Apply/Dismiss popover; sinkron ke panel kiri
- Inline AI edit: select text → "Edit with AI" popover → prompt → preview/apply
- Live contextual chat sebagai CV optimization copilot
- Sticky footer: Apply, Diff, Save optimized PDF, Save report
- Export: optimized PDF + analysis report (functional)
- Yjs CRDT + WebSocket foundation untuk real-time state management
- Job match: dipreserve di domain, tidak diekspos di workspace ini
- Styling: Mathical-inspired (dark shell, cream, sharp accent) — nyambung ke landing page yang ada

### Out of Scope (v4.0)

- Job match UX di workspace baru ini
- Compare with vacancy feature di workspace ini
- Multi-user real-time collaboration (backend foundation siap, UX belum)
- Mobile-first responsive redesign
- User accounts / authentication
- Template marketplace / full CV builder
- Video CV analysis

## Context

**Project Type:** Portfolio showcase for AI Engineer role applications

**Existing Codebase:**
This directory currently contains a GitHub Copilot Skills Repository (100+ skills for various technologies). The CV Analyzer is a new application that will be built alongside or replacing this existing codebase.

**Target Audience:**
- Primary: Recruiters and hiring managers evaluating AI Engineer candidates
- Secondary: Job seekers wanting to improve their CVs

**AI Capabilities to Showcase:**
1. **LLM Integration** — Semantic understanding, reasoning, prompt engineering, structured output
2. **NLP Techniques** — Text extraction, skill recognition, entity matching, keyword analysis
3. **RAG Architecture** — Vector embeddings, semantic search, knowledge retrieval from best practices
4. **AI Engineering Patterns** — Async processing, streaming responses, evaluation metrics, monitoring

## Constraints

- **Budget**: Use free-tier cloud services (Vercel, Railway, Cloudflare R2) — minimize costs
- **Timeline**: Portfolio project — no hard deadline, quality over speed
- **Tech Stack**: Python (FastAPI) + Next.js + PostgreSQL with pgvector
- **LLM Access**: Has API keys available (Claude/OpenAI)
- **Deployment**: Must be live production URL for portfolio sharing

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| FastAPI backend | Python async framework, ideal for AI/ML apps | — Pending |
| Next.js frontend | Modern React framework, App Router, server components | — Pending |
| shadcn/ui UI library | Popular 2025, Tailwind-based, impressive for portfolio | — Pending |
| PostgreSQL + pgvector | Single DB for relational + vector storage, production-ready | — Pending |
| Cloudflare R2 storage | S3-compatible, free tier, no egress fees, industry standard | — Pending |
| Vercel + Railway deployment | Separate frontend/backend, impressive architecture, free tiers | — Pending |
| Streaming SSE responses | Shows async communication knowledge, better UX, production pattern | — Pending |
| No authentication v1 | Simpler for portfolio, focus on AI capabilities over auth system | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-11 — Milestone v4.0 PDF-First Analysis Workspace started*
