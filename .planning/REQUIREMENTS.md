# Requirements: CV Analyzer

**Defined:** 2026-04-03
**Core Value:** Demonstrate AI Engineer mastery through production-ready CV analysis

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Document Upload & Parsing

- [ ] **UPLOAD-01**: User can upload PDF file for CV analysis
- [ ] **UPLOAD-02**: User can upload DOC/DOCX file for CV analysis
- [ ] **UPLOAD-03**: System extracts text from uploaded files with quality validation
- [ ] **UPLOAD-04**: System performs OCR fallback for scanned/image-based PDFs
- [ ] **UPLOAD-05**: System handles international CV formats (EU, Asia, US templates)
- [ ] **UPLOAD-06**: System validates extraction quality and shows error if parsing fails
- [ ] **UPLOAD-07**: Uploaded files are stored in Cloudflare R2 with temporary access

### Multi-Dimensional Scoring

- [ ] **SCORE-01**: System calculates overall CV score (0-100)
- [ ] **SCORE-02**: System calculates clarity score (readability, structure)
- [ ] **SCORE-03**: System calculates impact score (quantifiable achievements, metrics)
- [ ] **SCORE-04**: System calculates completeness score (required sections present)
- [ ] **SCORE-05**: System calculates relevance score (keyword matching, ATS compatibility)
- [ ] **SCORE-06**: System displays scores in visual dashboard with breakdown

### NLP Analysis

- [ ] **NLP-01**: System detects and extracts CV sections (header, experience, education, skills)
- [ ] **NLP-02**: System performs grammar and spelling check
- [ ] **NLP-03**: System validates CV formatting for ATS compatibility
- [ ] **NLP-04**: System extracts skills from CV text using NER
- [ ] **NLP-05**: System extracts entities (dates, companies, titles, education)

### LLM Analysis & Suggestions

- [ ] **LLM-01**: System generates AI-powered improvement suggestions with examples
- [ ] **LLM-02**: System provides specific action verb recommendations
- [ ] **LLM-03**: System analyzes and suggests impact metrics improvements
- [x] **LLM-04**: System uses structured JSON output with validation
- [x] **LLM-05**: System implements LLM service abstraction layer for provider switching
- [ ] **LLM-06**: System tracks token usage and implements cost controls

### RAG Knowledge Base

- [ ] **RAG-01**: System retrieves CV best practices from vector knowledge base
- [ ] **RAG-02**: System uses semantic search to find relevant improvement patterns
- [ ] **RAG-03**: System integrates retrieved context into LLM prompt for better suggestions
- [ ] **RAG-04**: Knowledge base includes Harvard/Indeed career guides, O*NET data
- [ ] **RAG-05**: System stores embeddings in PostgreSQL with pgvector

### Real-Time Streaming

- [x] **STREAM-01**: System shows real-time analysis progress via Server-Sent Events
- [x] **STREAM-02**: Frontend displays streaming updates ("Extracting text...", "Analyzing...", etc.)
- [x] **STREAM-03**: Backend implements async job queue with SSE streaming endpoint
- [x] **STREAM-04**: System handles connection failures and reconnection gracefully

### Job Comparison

- [x] **COMPARE-01**: User can paste job description for comparison
- [x] **COMPARE-02**: User can select job from pre-defined database
- [x] **COMPARE-03**: System calculates match percentage between CV and job description
- [x] **COMPARE-04**: System performs role-specific scoring based on job requirements
- [x] **COMPARE-05**: System displays skills gap analysis (present vs required skills)
- [x] **COMPARE-06**: System highlights missing qualifications and experience gaps

### Visualization & UX

- [x] **UX-01**: System displays skills gap heatmap visualization
- [x] **UX-02**: System provides before/after comparison view for suggestions
- [x] **UX-03**: System implements responsive design for mobile/desktop
- [x] **UX-04**: System shows loading states during async processing
- [x] **UX-05**: System uses shadcn/ui components with Tailwind styling

### Export & Results

- [x] **EXPORT-01**: User can download analysis results as PDF
- [x] **EXPORT-02**: User can copy individual suggestions to clipboard
- [x] **EXPORT-03**: System formats exported report with professional layout

### Error Handling & Reliability

- [x] **ERROR-01**: System validates input file type and size before upload
- [ ] **ERROR-02**: System handles LLM API failures gracefully with fallbacks
- [ ] **ERROR-03**: System implements rate limiting per IP address
- [x] **ERROR-04**: System logs errors for monitoring without exposing sensitive data
- [ ] **ERROR-05**: System implements data retention policy (auto-delete after 24h)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Authentication & Accounts

- **AUTH-01**: User can create account with email/password
- **AUTH-02**: User can save CV analysis history
- **AUTH-03**: User can re-analyze previous CVs

### Advanced Features

- **ADV-01**: LinkedIn profile import and analysis
- **ADV-02**: Anonymous benchmarking against other CVs
- **ADV-03**: Achievement highlighter and auto-enhancement
- **ADV-04**: Cover letter analysis and generation

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| User authentication v1 | Adds complexity; anonymous access sufficient for portfolio |
| Payment processing | Free portfolio project; no monetization needed |
| Mobile app | Web-first with responsive design sufficient |
| Video CV analysis | Specialized product; out of scope for CV analyzer |
| Real-time collaboration | Single-user analysis tool; no collaborative features |
| Social sharing | Portfolio project; no viral features needed |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

### Phase 1: Foundation & Document Pipeline

| Requirement | Description | Status |
|-------------|-------------|--------|
| UPLOAD-01 | User can upload PDF file for CV analysis | Pending |
| UPLOAD-02 | User can upload DOC/DOCX file for CV analysis | Pending |
| UPLOAD-03 | System extracts text from uploaded files with quality validation | Pending |
| UPLOAD-04 | System performs OCR fallback for scanned/image-based PDFs | Pending |
| UPLOAD-05 | System handles international CV formats | Pending |
| UPLOAD-06 | System validates extraction quality and shows error if parsing fails | Pending |
| UPLOAD-07 | Uploaded files are stored in Cloudflare R2 with temporary access | Pending |
| ERROR-01 | System validates input file type and size before upload | Complete |
| ERROR-05 | System implements data retention policy (auto-delete after 24h) | Pending |

### Phase 2: Basic Analysis Engine

| Requirement | Description | Status |
|-------------|-------------|--------|
| NLP-01 | System detects and extracts CV sections | Pending |
| NLP-02 | System performs grammar and spelling check | Pending |
| NLP-03 | System validates CV formatting for ATS compatibility | Pending |
| NLP-04 | System extracts skills from CV text using NER | Pending |
| NLP-05 | System extracts entities (dates, companies, titles, education) | Pending |
| SCORE-01 | System calculates overall CV score (0-100) | Pending |
| SCORE-02 | System calculates clarity score (readability, structure) | Pending |
| SCORE-03 | System calculates impact score (quantifiable achievements, metrics) | Pending |
| SCORE-04 | System calculates completeness score (required sections present) | Pending |
| SCORE-05 | System calculates relevance score (keyword matching, ATS compatibility) | Pending |
| SCORE-06 | System displays scores in visual dashboard with breakdown | Pending |
| ERROR-03 | System implements rate limiting per IP address | Pending |

### Phase 3: AI Intelligence Layer

| Requirement | Description | Status |
|-------------|-------------|--------|
| LLM-01 | System generates AI-powered improvement suggestions with examples | Pending |
| LLM-02 | System provides specific action verb recommendations | Pending |
| LLM-03 | System analyzes and suggests impact metrics improvements | Pending |
| LLM-04 | System uses structured JSON output with validation | Complete |
| LLM-05 | System implements LLM service abstraction layer for provider switching | Complete |
| LLM-06 | System tracks token usage and implements cost controls | Pending |
| RAG-01 | System retrieves CV best practices from vector knowledge base | Pending |
| RAG-02 | System uses semantic search to find relevant improvement patterns | Pending |
| RAG-03 | System integrates retrieved context into LLM prompt for better suggestions | Pending |
| RAG-04 | Knowledge base includes Harvard/Indeed career guides, O*NET data | Pending |
| RAG-05 | System stores embeddings in PostgreSQL with pgvector | Pending |
| ERROR-02 | System handles LLM API failures gracefully with fallbacks | Pending |

### Phase 4: Streaming & Comparison

| Requirement | Description | Status |
|-------------|-------------|--------|
| STREAM-01 | System shows real-time analysis progress via Server-Sent Events | Complete |
| STREAM-02 | Frontend displays streaming updates ("Extracting text...", "Analyzing...", etc.) | Complete |
| STREAM-03 | Backend implements async job queue with SSE streaming endpoint | Complete |
| STREAM-04 | System handles connection failures and reconnection gracefully | Complete |
| COMPARE-01 | User can paste job description for comparison | Complete |
| COMPARE-02 | User can select job from pre-defined database | Complete |
| COMPARE-03 | System calculates match percentage between CV and job description | Complete |
| COMPARE-04 | System performs role-specific scoring based on job requirements | Complete |
| COMPARE-05 | System displays skills gap analysis (present vs required skills) | Complete |
| COMPARE-06 | System highlights missing qualifications and experience gaps | Complete |
| UX-01 | System displays skills gap heatmap visualization | Complete |
| UX-02 | System provides before/after comparison view for suggestions | Complete |
| UX-03 | System implements responsive design for mobile/desktop | Complete |
| UX-04 | System shows loading states during async processing | Complete |
| UX-05 | System uses shadcn/ui components with Tailwind styling | Complete |
| EXPORT-01 | User can download analysis results as PDF | Complete |
| EXPORT-02 | User can copy individual suggestions to clipboard | Complete |
| EXPORT-03 | System formats exported report with professional layout | Complete |
| ERROR-04 | System logs errors for monitoring without exposing sensitive data | Complete |

### Phase 5: Advanced Features

**Note:** All v1 requirements are covered in Phases 1-4. Phase 5 is optional polish for production readiness and portfolio demonstration.

**Coverage:**
- v1 requirements: 47 total
- Mapped to phases: 47
- Unmapped: 0 ✓

---

## v2.0 Requirements — Seamless Homepage

**Defined:** 2026-04-10
**Milestone goal:** Redesign homepage into a full landing page with strong visual hierarchy and seamless UX.

### Infrastructure Fixes

- [ ] **INFRA-01**: User benefits from Inter font correctly applied sitewide (wire to Tailwind `fontFamily.sans`)
- [ ] **INFRA-02**: Page root is a React Server Component shell (remove `"use client"` from `app/page.tsx`)
- [ ] **INFRA-03**: shadcn Dialog primitive is available for use (`npx shadcn@latest add dialog`)

### Navbar

- [ ] **NAV-01**: User sees a sticky navbar with app logo and "Analyze My CV" CTA button

### Hero Section

- [ ] **HERO-01**: User sees a hero section with strong tagline and sub-headline listing the 4 scoring dimensions
- [ ] **HERO-02**: User can click hero CTA to open the upload modal
- [ ] **HERO-03**: Hero has gradient text on keyword and a dot-grid background pattern

### Features Section

- [ ] **FEAT-01**: User sees 3 feature cards: AI Scoring, Skill Gap Analysis, Job Match Comparison
- [ ] **FEAT-02**: Feature cards animate on hover with a lift effect

### How It Works Section

- [ ] **HIWS-01**: User sees a 4-step visual flow: Upload → Analyze → Compare → Export
- [ ] **HIWS-02**: Step 3 shows an animated score counter that counts up when the section enters the viewport

### Upload Modal

- [ ] **MODAL-01**: User can open the upload modal from any CTA button (navbar or hero)
- [ ] **MODAL-02**: Existing upload zone, SSE streaming, and navigation to results page work correctly inside the modal
- [ ] **MODAL-03**: User cannot close the modal while upload or analysis is in progress

### Brand & Navigation (v2.0)

- [ ] **NAV-02**: Multi-product navbar with 3 product links (CV Analyzer → overlay, CV Builder → /cv-builder, Job Finding → /job-finding) and hamburger mobile menu
- [ ] **HOME-01**: Full marketing homepage with Hero, Product Cards, Features, How It Works, and Stats sections
- [ ] **HOME-02**: Homepage and navbar "Start Analyzing" / "Get Started" CTAs open the upload overlay
- [ ] **HOME-03**: /cv-builder and /job-finding render "Coming Soon" placeholder pages with email capture

### Scroll Animations

- [ ] **ANIM-01**: All landing sections fade-in and slide-up when they enter the viewport
- [ ] **ANIM-02**: Animations are skipped when user has `prefers-reduced-motion` enabled

## Traceability v2.0

### Phase 6: Infrastructure & Primitives

| Requirement | Description | Status |
|-------------|-------------|--------|
| INFRA-01 | Inter font wired to Tailwind fontFamily.sans | Pending |
| INFRA-02 | Remove "use client" from page root — RSC shell | Pending |
| INFRA-03 | Install shadcn Dialog primitive | Pending |

### Phase 7: Static Landing Sections

| Requirement | Description | Status |
|-------------|-------------|--------|
| NAV-01 | Sticky navbar with logo and CTA | Pending |
| FEAT-01 | 3 AI feature cards | Pending |
| FEAT-02 | Hover lift on feature cards | Pending |
| HIWS-01 | 4-step How It Works flow | Pending |

### Phase 8: Upload Modal + Navbar Expansion

| Requirement | Description | Status |
|-------------|-------------|--------|
| MODAL-01 | Upload modal opens from any CTA | Pending |
| MODAL-02 | Full upload + SSE + navigation in modal | Pending |
| MODAL-03 | Modal close blocked during processing | Pending |
| NAV-02 | Multi-product navbar with 3 product links + mobile hamburger | Pending |
| HOME-01 | Full marketing homepage (Hero + Products + Features + HIWS + Stats) | Pending |
| HOME-02 | CTA buttons open upload overlay | Pending |
| HOME-03 | /cv-builder and /job-finding Coming Soon pages | Pending |

### Phase 9: Hero Integration

| Requirement | Description | Status |
|-------------|-------------|--------|
| HERO-01 | Hero section with tagline and scoring dimensions sub-headline | Pending |
| HERO-02 | Hero CTA opens upload modal | Pending |
| HERO-03 | Gradient text + dot-grid background | Pending |

### Phase 10: Animation Polish

| Requirement | Description | Status |
|-------------|-------------|--------|
| ANIM-01 | Scroll fade-in/slide-up on all sections | Pending |
| ANIM-02 | prefers-reduced-motion respected | Pending |
| HIWS-02 | Animated score counter on scroll | Pending |

---
*Requirements defined: 2026-04-03*
*Last updated: 2026-04-10 — v2.0 Seamless Homepage requirements mapped to phases 6–10 (16 requirements, 16/16 coverage)*
