# Roadmap: CV Analyzer

**Created:** 2026-04-03
**Granularity:** Standard
**Coverage:** 47/47 requirements mapped

## Phases

- [x] **Phase 1: Foundation & Document Pipeline** - Robust file upload, parsing, and async architecture ✅ **COMPLETE**
- [x] **Phase 2: Basic Analysis Engine** - NLP-based scoring, section detection, and validation ✅ **COMPLETE**
- [ ] **Phase 3: AI Intelligence Layer** - LLM-powered analysis, suggestions, and cost controls
- [ ] **Phase 4: Streaming & Comparison** - Real-time UX, job comparison, and visualizations
- [ ] **Phase 5: Advanced Features** - RAG knowledge base and polish (optional)

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

**Plans**: TBD

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
- [x] 03-01-PLAN.md — Infrastructure Setup: pgvector package, Docker image, migrations, config (Wave 1)
- [ ] 03-02-PLAN.md — LLM Service + RAG Service: Protocol/OpenAI impl, pgvector retrieval, seed script (Wave 2)
- [ ] 03-03-PLAN.md — Celery Task + Grammar Chain Fix: de-finalize grammar_check, create llm_suggest_task (Wave 3)
- [ ] 03-04-PLAN.md — API Schema Extension: SuggestionItem/Card schemas, results endpoint update (Wave 4)
- [ ] 03-05-PLAN.md — Frontend Suggestion Components: types, processing stages, suggestion cards UI (Wave 5)

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

**Plans**: 7 plans across 5 waves (0–4)

Plans:
- [x] 04-00-PLAN.md — Setup: WeasyPrint install, shadcn textarea, 5 test stubs (Wave 0)
- [x] 04-01-PLAN.md — DB Foundation: Alembic migration + JobRole model + schemas + mask_pii (Wave 1)
- [ ] 04-02-PLAN.md — Comparison Backend: compare_cv_task + GET /job-roles + POST /jobs/{id}/compare (Wave 2)
- [ ] 04-03-PLAN.md — Export Backend: WeasyPrint PDF endpoint + Jinja2 template + results.py extension (Wave 2)
- [x] 04-04-PLAN.md — Frontend Types + Compare Input: types.ts + SSE stage + CompareTab + MatchScoreCard (Wave 2)
- [ ] 04-05-PLAN.md — Compare Result Components: SkillsGapDisplay + MissingQualificationsList + Skeleton + BeforeAfter (Wave 3)
- [ ] 04-06-PLAN.md — Wiring + Export UI: Tab 5 + SuggestionCard toggle + ExportStickyBar + responsive (Wave 4)

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

**Plans**: TBD

**Note**: This phase is optional polish if Phases 1-4 are complete and robust. All v1 requirements are covered in Phases 1-4.

## Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Document Pipeline | 5/5 | ✅ Complete | 2026-04-05 |
| 2. Basic Analysis Engine | 6/6 | ✅ Complete | 2026-04-06 |
| 3. AI Intelligence Layer | 0/5 | Planned | - |
| 4. Streaming & Comparison | 3/7 | In Progress|  |
| 5. Advanced Features | 0/0 | Not started | - |

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
```

## Coverage Summary

**Total v1 requirements:** 47
**Mapped to phases:** 47 ✓
**Orphaned requirements:** 0

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
*Next: `/gsd:plan-phase 1`*
