# Roadmap: CV Analyzer

**Created:** 2026-04-03
**Granularity:** Standard
**Coverage:** 47/47 requirements mapped

## Phases

- [x] **Phase 1: Foundation & Document Pipeline** - Robust file upload, parsing, and async architecture ✅ **COMPLETE**
- [x] **Phase 2: Basic Analysis Engine** - NLP-based scoring, section detection, and validation ✅ **COMPLETE**
- [x] **Phase 3: AI Intelligence Layer** - LLM-powered analysis, suggestions, and cost controls ✅ **COMPLETE** (2026-04-08)
- [x] **Phase 4: Streaming & Comparison** - Real-time UX, job comparison, and visualizations ✅ **COMPLETE** (2026-04-06)
- [ ] **Phase 5: Advanced Features** - RAG knowledge base and polish (optional)

## v2.0 — Seamless Homepage

- [x] **Phase 6: Infrastructure & Primitives** - Font wiring, RSC shell, Dialog primitive (zero-risk prerequisites) (completed 2026-04-10)
- [x] **Phase 7: Static Landing Sections** - Navbar, Features, How It Works server components (completed 2026-04-10)
- [x] **Phase 8: Upload Modal + Navbar Expansion** - Brand "pathkr", multi-product navbar, full marketing homepage, full-screen upload overlay ✅ **COMPLETE**
- [ ] **Phase 9: Visual Design System** - Full Mathical-style redesign: Bricolage Grotesque font, cream palette, dark hero cards, word-pill headlines (all pages)
- [ ] **Phase 10: Animation Polish** - Scroll animations, score counter, reduced-motion support

## Phase Details

### Phase 1: Foundation & Document Pipeline

**Goal**: Users can upload CV files and receive reliable text extraction with real-time progress feedback

**Depends on**: Nothing (first phase)

**Requirements**: UPLOAD-01, UPLOAD-02, UPLOAD-03, UPLOAD-04, UPLOAD-05, UPLOAD-06, UPLOAD-07, ERROR-01, ERROR-05

**Success Criteria** (what must be TRUE):
1. User can upload PDF or DOC/DOCX files through web interface
2. System extracts text from uploaded files with quality validation and handles failures gracefully
3. System performs OCR fallback for scanned PDFs and international CV formats
4. Uploaded files are stored in Cloudflare R2 with temporary access and auto-delete after 24h
5. Backend implements async processing pipeline with job queue for non-blocking operations

**Plans**: 5 plans across 4 waves

Plans:
- [x] 01-01-PLAN.md — Backend Foundation & Database Setup (Wave 1) ✅ **COMPLETE**
- [x] 01-02-PLAN.md — Frontend Foundation & UI Setup (Wave 1) ✅ **COMPLETE**
- [x] 01-03-PLAN.md — Document Parsing & Storage Services (Wave 2) ✅ **COMPLETE**
- [x] 01-04-PLAN.md — Async Processing & API Endpoints (Wave 3) ✅ **COMPLETE**
- [x] 01-05-PLAN.md — Upload UI & Frontend Integration (Wave 4) ✅ **COMPLETE**

**UI hint**: yes

### Phase 2: Basic Analysis Engine

**Goal**: Users receive multi-dimensional CV scores and section-based analysis using NLP techniques

**Depends on**: Phase 1 (document pipeline)

**Requirements**: NLP-01, NLP-02, NLP-03, NLP-04, NLP-05, SCORE-01, SCORE-02, SCORE-03, SCORE-04, SCORE-05, SCORE-06, ERROR-03

**Success Criteria** (what must be TRUE):
1. User sees overall CV score (0-100) with breakdown across clarity, impact, completeness, and relevance dimensions
2. System detects and extracts CV sections (header, experience, education, skills) with entity recognition
3. User receives grammar/spelling feedback and ATS formatting validation
4. System extracts skills and entities (dates, companies, titles, education) from CV text
5. System implements rate limiting per IP address to prevent abuse

**Plans**: 6 plans across 4 waves

Plans:
- [x] 02-01-PLAN.md — NLP Service + Entity Extraction (Wave 1) ✅
- [x] 02-02-PLAN.md — Section Detection + Scoring Rules (Wave 2) ✅
- [x] 02-03-PLAN.md — Grammar + ATS Checks (Wave 2) ✅
- [x] 02-04-PLAN.md — Results Schemas + Endpoints (Wave 3) ✅
- [x] 02-05-PLAN.md — Results UI + Gauge Charts (Wave 3) ✅
- [x] 02-06-PLAN.md — SSE Streaming + Error Handling (Wave 4) ✅

**UI hint**: yes

### Phase 3: AI Intelligence Layer

**Goal**: Users receive AI-powered improvement suggestions with cost-controlled LLM integration

**Depends on**: Phase 2 (basic analysis)

**Requirements**: LLM-01, LLM-02, LLM-03, LLM-04, LLM-05, LLM-06, RAG-01, RAG-02, RAG-03, RAG-04, RAG-05, ERROR-02

**Success Criteria** (what must be TRUE):
1. User receives AI-generated improvement suggestions with specific examples and action verb recommendations
2. System analyzes and suggests impact metrics improvements (quantifiable achievements)
3. LLM service uses structured JSON output with validation and implements provider abstraction layer
4. System tracks token usage and implements cost controls with rate limits
5. System retrieves CV best practices from vector knowledge base and integrates into LLM prompts

**Plans**: 5 plans across 5 waves

Plans:
- [x] 03-01-PLAN.md — Infrastructure Setup: pgvector package, Docker image, migrations, config (Wave 1) ✅
- [x] 03-02-PLAN.md — LLM Service + RAG Service: Protocol/OpenAI impl, pgvector retrieval, seed script (Wave 2) ✅
- [x] 03-03-PLAN.md — Celery Task + Grammar Chain Fix: de-finalize grammar_check, create llm_suggest_task (Wave 3) ✅
- [x] 03-04-PLAN.md — API Schema Extension: SuggestionItem/Card schemas, results endpoint update (Wave 4) ✅
- [x] 03-05-PLAN.md — Frontend Suggestion Components: types, processing stages, suggestion cards UI (Wave 5) ✅

### Phase 4: Streaming & Comparison

**Goal**: Users experience real-time analysis progress and can compare CVs against job descriptions

**Depends on**: Phase 3 (AI intelligence)

**Requirements**: STREAM-01, STREAM-02, STREAM-03, STREAM-04, COMPARE-01, COMPARE-02, COMPARE-03, COMPARE-04, COMPARE-05, COMPARE-06, UX-01, UX-02, UX-03, UX-04, UX-05, EXPORT-01, EXPORT-02, EXPORT-03, ERROR-04

**Success Criteria** (what must be TRUE):
1. User sees real-time analysis progress updates via Server-Sent Events with stage indicators
2. User can paste job description or select from database for CV comparison
3. System displays match percentage, skills gap heatmap, and missing qualifications
4. User can download analysis results as PDF and copy suggestions to clipboard
5. System handles connection failures gracefully, implements responsive design, and logs errors without exposing sensitive data

**Plans**: 18 plans across 4 waves (0–3)

Plans:
- [x] 04-00-PLAN.md — Setup: WeasyPrint install, shadcn textarea, 5 test stubs (Wave 0) ✅
- [x] 04-01-PLAN.md — DB Foundation: Alembic migration + JobRole model + schemas + mask_pii (Wave 1) ✅
- [x] 04-02-PLAN.md — Comparison Backend: compare_cv_task + GET /job-roles + POST /jobs/{id}/compare (Wave 2) ✅
- [x] 04-03-PLAN.md — Export Backend: WeasyPrint PDF endpoint + Jinja2 template + results.py extension (Wave 2) ✅
- [x] 04-04-PLAN.md — Frontend Types + Compare Input: types.ts + SSE stage + CompareTab + MatchScoreCard (Wave 2) ✅
- [x] 04-05-PLAN.md — Compare Result Components: SkillsGapDisplay + MissingQualificationsList + Skeleton + BeforeAfter (Wave 3) ✅
- [x] 04-06-PLAN.md — Wiring + Export UI: Tab 5 + SuggestionCard toggle + ExportStickyBar + responsive (Wave 4) ✅
- [x] 04-07-PLAN.md — Gap Closure: Fix export endpoint type mismatch (Wave 1) ✅
- [x] 04-08-PLAN.md — Gap Closure: Install pgvector dependency (Wave 1) ✅
- [x] 04-09-PLAN.md — Gap Closure: Fix Next.js IPv6 connection (Wave 1) ✅
- [x] 04-10-PLAN.md — Gap Closure: Add Before/After text comparison (Wave 2) ✅
- [x] 04-11-PLAN.md — Gap Closure: Fix export bar animation (Wave 1) ✅
- [x] 04-12-PLAN.md — Gap Closure: Add WeasyPrint to requirements.txt (Wave 1)
- [x] 04-13-PLAN.md — Gap Closure: Move ExportStickyBar outside main element (Wave 1)
- [x] 04-14-PLAN.md — Gap Closure: Add original_text to SuggestionItem schema (Wave 1)
- [x] 04-15-PLAN.md — Gap Closure: Install WeasyPrint in conda environment (Wave 2)
- [ ] 04-16-PLAN.md — Gap Closure: Fix export template path + error handling + dependency pin drift (Wave 1)
- [ ] 04-17-PLAN.md — Gap Closure: Normalize suggestion keys + copy all suggestions (Wave 1)

**UI hint**: yes

### Phase 5: Advanced Features

**Goal**: Enhanced CV analysis with RAG-powered best practices and production polish

**Depends on**: Phase 4 (streaming & comparison)

**Requirements**: None (all requirements covered in Phases 1-4)

**Success Criteria** (what must be TRUE):
1. System demonstrates production-ready architecture with comprehensive error handling
2. All AI capabilities showcase modern AI engineering patterns (async processing, streaming, RAG)
3. Application is deployed to production URL for portfolio sharing
4. Code quality and architecture demonstrate deep understanding of full-stack AI engineering

**Plans**: 5 plans

Plans:
- [ ] 05-00-PLAN.md — Deployment Infrastructure: Dockerfile, docker-entrypoint.sh, .env.example, .dockerignore (Wave 0)
- [ ] 05-01-PLAN.md — RAG Knowledge Base: 11 curated .txt files + seed_knowledge.py rewrite (Wave 1)
- [ ] 05-02-PLAN.md — Sample CV Demo: Alex Chen PDF + "Try with sample CV →" button (Wave 1)
- [ ] 05-03-PLAN.md — Reliability & Docs: ERROR-02/05 verification tests + DEPLOYMENT.md guide (Wave 2)
- [ ] 05-04-PLAN.md — Production Deploy Checklist: Vercel + Railway + R2 + seed knowledge base (Wave 3, human-guided)

**Note**: This phase is optional polish if Phases 1-4 are complete and robust. All v1 requirements are covered in Phases 1-4.

---

## v2.0 — Seamless Homepage Phase Details

### Phase 6: Infrastructure & Primitives

**Goal**: Foundation is laid so all landing page components can build without blockers

**Depends on**: Phase 5 (or independently: v1.0 codebase complete)

**Requirements**: INFRA-01, INFRA-02, INFRA-03

**Success Criteria** (what must be TRUE):
  1. Inter font renders consistently sitewide — any text in new sections uses Inter, not system fallback font
  2. `app/page.tsx` is a React Server Component — `"use client"` directive removed, Next.js build shows it as RSC with no JS bundle inflation
  3. `components/ui/dialog.tsx` exists and is importable — `npx shadcn@latest add dialog` completed successfully

**Plans**: 3 plans across 3 waves

Plans:
- [x] 06-01-PLAN.md — Font wiring (INFRA-01) + Dialog install (INFRA-03) (Wave 1)
- [x] 06-02-PLAN.md — RSC shell extraction: upload-section.tsx island + page.tsx rewrite (INFRA-02) (Wave 2)
- [x] 06-03-PLAN.md — ScrollReveal primitive + globals.css reduced-motion overrides + final build verify (Wave 3)

**UI hint**: yes

### Phase 7: Static Landing Sections

**Goal**: Users can see a fully-styled landing page skeleton — sticky navbar, feature cards, and how-it-works steps

**Depends on**: Phase 6 (RSC shell + Inter font wired)

**Requirements**: NAV-01, FEAT-01, FEAT-02, HIWS-01

**Success Criteria** (what must be TRUE):
  1. A sticky navbar is visible at the top of every scroll position with the app logo and "Analyze My CV" CTA button
  2. Three feature cards (AI Scoring, Skill Gap Analysis, Job Match Comparison) display with icons and one-sentence descriptions
  3. Feature cards visually lift with a shadow on hover (`hover:-translate-y-1 hover:shadow-md`)
  4. A four-step "How It Works" flow (Upload → Analyze → Compare → Export) is visible with step connectors on desktop

**Plans**: 3 plans across 3 waves

Plans:
- [x] 07-01-PLAN.md — Foundation fixes: globals.css scroll-behavior + upload-section.tsx main→section (Wave 1)
- [x] 07-02-PLAN.md — Navbar + FeaturesSection RSC components (Wave 2)
- [x] 07-03-PLAN.md — HowItWorksSection + page.tsx full landing composition (Wave 3)

**UI hint**: yes

### Phase 8: Upload Modal + Navbar Expansion

**Goal**: Brand "pathkr" launches — full product marketing homepage, multi-product navbar, and full-screen upload overlay

**Depends on**: Phase 6 (Dialog primitive available), Phase 7 (landing sections as base)

**Requirements**: MODAL-01, MODAL-02, MODAL-03, NAV-02, HOME-01, HOME-02, HOME-03

**Success Criteria** (what must be TRUE):
  1. Brand renamed to "pathkr" sitewide (navbar logo, page title, meta description)
  2. Navbar has 3 product links: CV Builder → /cv-builder, CV Analyzer → upload overlay, Job Finding → /job-finding
  3. /cv-builder and /job-finding show "Coming Soon" placeholder pages
  4. Homepage is a full marketing page: Hero + Product Cards + Features + How It Works + Stats
  5. "Start Analyzing" CTA (hero and navbar) opens a full-screen upload overlay
  6. Existing upload zone, SSE streaming, and auto-navigation to results work inside the overlay — zero regression
  7. Overlay close is blocked while upload or analysis is in progress

**Plans**: 5 plans across 3 waves (complete)

Plans:
- [x] 08-01-PLAN.md — Foundation: Sheet install, UploadModalProvider, brand rename, dialog + upload-section mods (Wave 1) ✅
- [x] 08-02-PLAN.md — Navbar Overhaul: pathkr logo, 3 product links, Sheet mobile drawer (Wave 2) ✅
- [x] 08-03-PLAN.md — Upload Overlay: full-screen Dialog with processing lock (Wave 2) ✅
- [x] 08-04-PLAN.md — Homepage Sections: HeroSection, ProductsSection, ProductCardCTA island, StatsSection (Wave 2) ✅
- [x] 08-05-PLAN.md — Coming Soon Pages + page.tsx Final Assembly (Wave 3) ✅

**UI hint**: yes

### Phase 9: Visual Design System

**Goal**: All pages of pathkr are visually redesigned to match the Mathical aesthetic — Bricolage Grotesque display font, cream background, dark hero cards, word-pill headline treatment, vivid accent colors (lime, pink, orange, purple)

**Depends on**: Phase 8 (upload modal + navbar complete)

**Requirements**: HERO-01, HERO-02, HERO-03, VIS-01, VIS-02, VIS-03

**Success Criteria** (what must be TRUE):
  1. Page background is cream (#F5F2D8), dark hero card (#141414) on homepage
  2. Bricolage Grotesque ExtraBold loads and is applied to all display headlines
  3. Hero headline uses word-pill treatment with colored pills (lime, pink, orange, purple) interleaved with headline words
  4. Accent colors (lime, pink, orange, purple) are used consistently across all sections
  5. Coming Soon pages and Results page use the new design system
  6. All existing upload/analysis functionality continues to work correctly

**Plans**: 3 plans across 3 waves

Plans:
- [ ] 09-01-PLAN.md — Design System Foundation: globals.css tokens + tailwind config + Bricolage Grotesque font + AccentPill component (Wave 1)
- [ ] 09-02-PLAN.md — Landing Page Redesign: navbar + HeroSection full rebuild + Products/Features/HIWS/Stats sections + coming-soon pages (Wave 2)
- [ ] 09-03-PLAN.md — Results Page Redesign: results page restyle + critical bg-secondary fix in ResultsTabs + ExportStickyBar/ResultsError/ScoreRangeBadge/ResultsSkeleton (Wave 3)

**UI hint**: yes

### Phase 10: Animation Polish

**Goal**: The homepage feels polished and accessible — sections animate on scroll, and all motion preferences are respected

**Depends on**: Phase 9 (all sections visible and integrated)

**Requirements**: ANIM-01, ANIM-02, HIWS-02

**Success Criteria** (what must be TRUE):
  1. Each landing section (navbar excluded) fades in and slides up when it enters the viewport for the first time on scroll
  2. The score counter in "How It Works" Step 3 counts up from 0 to the target value when that section scrolls into view
  3. All CSS entrance animations and the score counter animation are completely suppressed when the user's OS reports `prefers-reduced-motion: reduce`

**Plans**: TBD

**UI hint**: yes

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Document Pipeline | 5/5 | ✅ Complete | 2026-04-05 |
| 2. Basic Analysis Engine | 6/6 | ✅ Complete | 2026-04-06 |
| 3. AI Intelligence Layer | 5/5 | ✅ Complete | 2026-04-08 |
| 4. Streaming & Comparison | 18/18 | Complete   | 2026-04-09 |
| 5. Advanced Features | 0/5 | Not started | - |
| 6. Infrastructure & Primitives | 3/3 | Complete   | 2026-04-10 |
| 7. Static Landing Sections | 3/3 | Complete   | 2026-04-10 |
| 8. Upload Modal + Navbar Expansion | 5/5 | ✅ Complete | 2026-01-27 |
| 9. Hero Integration | 0/0 | Not started | - |
| 10. Animation Polish | 0/0 | Not started | - |

## Phase Dependencies

```
Phase 1: Foundation
    ↓
Phase 2: Basic Analysis (requires document pipeline)
    ↓
Phase 3: AI Intelligence (requires basic scoring)
    ↓
Phase 4: Streaming & Comparison (requires AI analysis)
    ↓
Phase 5: Advanced Features (optional polish)

── v2.0 Seamless Homepage ──────────────────────────

Phase 6: Infrastructure & Primitives (font, RSC shell, Dialog)
    ↓
Phase 7: Static Landing Sections (navbar, features, how-it-works)
Phase 8: Upload Modal Migration ──────────────────────────┐
    (both unblock Phase 9 — can build in parallel)        │
                                              ↓           ↓
                                         Phase 9: Hero Integration
                                              ↓
                                         Phase 10: Animation Polish
```

## Coverage Summary

**Total v1 requirements:** 47
**Mapped to phases:** 47 ✓
**Orphaned requirements:** 0

### v2.0 Coverage Summary

**Total v2.0 requirements:** 16
**Mapped to phases:** 16 ✓
**Orphaned requirements:** 0

### Requirement Distribution (v2.0)

| Phase | Requirements | Categories |
|-------|--------------|------------|
| 6 | 3 | Infrastructure Fixes (3) |
| 7 | 4 | Navbar (1) + Features (2) + How It Works partial (1) |
| 8 | 3 | Upload Modal (3) |
| 9 | 3 | Hero Section (3) |
| 10 | 3 | Scroll Animations (2) + How It Works counter (1) |

### Requirement Distribution

| Phase | Requirements | Categories |
|-------|--------------|------------|
| 1 | 9 | Document Upload (7) + Error Handling (2) |
| 2 | 17 | NLP Analysis (5) + Scoring (6) + Error Handling (1) + Foundation (5) |
| 3 | 11 | LLM Analysis (6) + RAG (5) |
| 4 | 19 | Streaming (4) + Job Comparison (6) + UX (5) + Export (3) + Error Handling (1) |
| 5 | 0 | All requirements covered in Phases 1-4 |

**Note:** Phase 2 includes 5 foundation requirements (async architecture from Phase 1) that enable the analysis engine. ERROR-03 (rate limiting) is placed in Phase 2 to protect the analysis endpoints.

---
*Roadmap created: 2026-04-03*
*Last updated: 2026-04-10 (v2.0 Seamless Homepage phases 6–10 added)*
*Next: `/gsd-plan-phase 6`*
