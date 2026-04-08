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

(None — all v1 requirements validated)

### Out of Scope

- User accounts and authentication (v1 is public anonymous access)
- Payment processing (free portfolio project)
- Mobile app (web-first, mobile responsive)
- Real-time collaboration features
- Video CV analysis (text-only for v1)

### Out of Scope

- User accounts and authentication (v1 is public anonymous access)
- Payment processing (free portfolio project)
- Mobile app (web-first, mobile responsive)
- Real-time collaboration features
- Video CV analysis (text-only for v1)

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
*Last updated: 2026-04-08 after Phase 4 (Streaming & Comparison) completion*
