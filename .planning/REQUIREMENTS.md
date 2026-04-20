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
*Last updated: 2026-04-11 — v4.0 PDF-First Analysis Workspace: 22 requirements defined, 5 phases (13–17)*

## v3.0 Requirements — Agentic CV Workspace

**Defined:** 2026-04-11
**Milestone goal:** Turn CV Analyzer into an editable, agent-assisted workspace with inline content editing, layout control, live analysis context, and exportable improved CV output.

### Workspace Routing & Lifecycle

- [x] **WS-01**: After upload/analysis, user is redirected to a dedicated workspace route for that job/CV
- [x] **WS-02**: Workspace shows loading/progressive hydration while CV content and analysis data are being prepared
- [x] **WS-03**: Existing results page remains available as a separate route/view for the same job

### Editable CV Canvas

- [ ] **CANVAS-01**: Parsed CV is rendered into editable blocks grouped by section (summary, experience, education, skills, etc.)
- [ ] **CANVAS-02**: User can click into blocks and edit text inline
- [x] **CANVAS-03**: User can reorder or restructure supported content blocks/sections safely
- [x] **CANVAS-04**: User can adjust layout/formatting controls (spacing, emphasis, section presentation, bullet formatting)
- [x] **CANVAS-05**: Workspace maintains a live preview surface representing the edited CV version

### Agentic Editing

- [ ] **AGENT-01**: User can trigger targeted AI actions such as rewrite summary, strengthen bullets, tailor to JD, and ATS-safe normalization
- [ ] **AGENT-02**: AI suggestions are attached to relevant blocks/sections, not only shown as global tips
- [ ] **AGENT-03**: User can accept, reject, or regenerate AI drafts before applying them
- [ ] **AGENT-04**: Workspace exposes an action queue / command center showing pending, ready, or applied edits

### Analysis Cockpit Integration

- [ ] **COCKPIT-01**: Key scores (overall, ATS, role match, open edits) remain visible in the workspace
- [ ] **COCKPIT-02**: Analysis side panels show skill gaps, ATS risks, and comparison context while editing
- [ ] **COCKPIT-03**: Workspace can surface why a change is recommended and what metric/goal it improves

### Export & Output

- [ ] **OUTPUT-01**: User can preview the edited CV as a polished final document
- [ ] **OUTPUT-02**: User can export/download the edited CV version without authentication
- [ ] **OUTPUT-03**: User can generate at least one tailored export variant while keeping the original analysis job context

### Reliability & Safety

- [x] **SAFE-01**: Safe formatting actions do not break CV readability or section integrity
- [ ] **SAFE-02**: If AI editing fails, manual editing and existing results page remain usable
- [x] **SAFE-03**: Edited content remains tied to the originating job/CV without requiring permanent user accounts

## Traceability v3.0

### Phase 11: Workspace Foundation & Routing

| Requirement | Description | Status |
|-------------|-------------|--------|
| WS-01 | Redirect completed uploads into workspace route | Complete |
| WS-02 | Loading / hydration state for workspace | Complete |
| WS-03 | Results page preserved as separate route | Complete |
| SAFE-03 | Edited content tied to originating job/CV context | Complete |

### Phase 12: Editable Canvas & Layout Controls

| Requirement | Description | Status |
|-------------|-------------|--------|
| CANVAS-01 | Render parsed CV into editable sections/blocks | Pending |
| CANVAS-02 | Inline text editing | Pending |
| CANVAS-03 | Safe block/section restructuring | Complete |
| CANVAS-04 | Layout / formatting controls | Complete |
| CANVAS-05 | Live CV preview surface | Complete |
| SAFE-01 | Safe formatting preserves readable CV structure | Complete |

### Phase 13: Agentic Review Cockpit

| Requirement | Description | Status |
|-------------|-------------|--------|
| AGENT-01 | Targeted AI editing actions | Pending |
| AGENT-02 | Suggestions attached to relevant blocks | Pending |
| AGENT-03 | Accept / reject / regenerate drafts | Pending |
| AGENT-04 | Action queue / command center | Pending |
| COCKPIT-01 | Persistent score cards in workspace | Pending |
| COCKPIT-02 | Side panels for gaps / ATS / compare context | Pending |
| COCKPIT-03 | Explain why each edit is recommended | Pending |

### Phase 14: Preview, Export & Variants

| Requirement | Description | Status |
|-------------|-------------|--------|
| OUTPUT-01 | Polished preview of edited CV | Pending |
| OUTPUT-02 | Export/download edited CV | Pending |
| OUTPUT-03 | Tailored export variant generation | Pending |
| SAFE-02 | Graceful fallback if AI editing fails | Pending |

---

## v4.0 Requirements — PDF-First Analysis Workspace

**Defined:** 2026-04-11
**Milestone goal:** Rebuild the CV Analyzer workspace into a PDF-first, 3-panel experience with actionable AI suggestions (stabilo anchors), inline AI editing, live contextual chat, and a real-time CRDT foundation ready for collaborative editing.

### PDF Viewer

- [x] **PDF-01**: PDF rendered via react-pdf v10 with text layer enabled (`renderTextLayer: true`) for text selection support
- [x] **PDF-02**: Backend provides `GET /jobs/{id}/file` presigned URL endpoint so frontend can load the PDF binary
- [x] **PDF-03**: Workspace defaults to optimized PDF view; original uploaded PDF preserved as immutable source
- [ ] **PDF-04**: Diff toggle switches single-view between original uploaded PDF and optimized PDF (not side-by-side)

### 3-Panel Workspace Layout

- [x] **LAYOUT-01**: Workspace uses 3-panel layout: left detail panel (analysis tabs), center PDF viewer, right summary rail + chat
- [x] **LAYOUT-02**: New workspace implemented as parallel route `/workspace-v2/[job_id]` during migration; upload flow updated to redirect here at cutover
- [ ] **LAYOUT-03**: Sticky action footer always visible (compact, right-aligned): Apply, Diff, Save optimized PDF, Save report

### Annotation System

- [ ] **ANNOT-01**: AI suggestions rendered as stabilo (colored highlight) overlays on optimized PDF pages via `customTextRenderer`
- [ ] **ANNOT-02**: Hovering a suggestion annotation for ~1.5s shows an Apply/Dismiss popover (useRef + setTimeout pattern)
- [ ] **ANNOT-03**: Hover on suggestion annotation syncs left detail panel to scroll to and highlight the matching suggestion card
- [ ] **ANNOT-04**: Suggestion anchors (section, text fragment, offset) stored as JSONB in PostgreSQL (`suggestion_anchors` column on jobs table)

### Inline AI Edit

- [ ] **INLINE-01**: User can select text in the PDF viewer → "Edit with AI" popover appears at selection end
- [ ] **INLINE-02**: Popover accepts a text prompt → preview rewrite → user can apply to optimized document
- [ ] **INLINE-03**: Backend endpoint handles inline AI rewrite requests (prompt + context → rewritten text)

### Live Contextual Chat

- [ ] **CHAT-01**: Right rail includes a live chat panel acting as a contextual CV optimization copilot
- [ ] **CHAT-02**: Chat responses stream via `fetch + ReadableStream` (POST-based, not EventSource)
- [ ] **CHAT-03**: Chat receives system context injected from: CV scores, active suggestions, grammar issues, and current edit state

### CRDT & Real-time Foundation

- [x] **CRDT-01**: Workspace document state managed via Yjs `Y.Doc` with `y-indexeddb` browser persistence (Phase 1 — single user)
- [ ] **CRDT-02**: Backend exposes `pycrdt-websocket` WebSocket endpoint mounted at `/yjs` in FastAPI (Phase 2 — multi-user ready, activated in later phase)
- [x] **CRDT-03**: Parsed CV content stored as structured editable mirror (`cv_document` JSONB column on jobs table); mapped from existing NLP output

### Export

- [x] **EXPV4-01**: "Save optimized PDF" generates a downloadable PDF from the current `cv_document` state via WeasyPrint + Jinja2 template
- [x] **EXPV4-02**: "Save report" generates a downloadable analysis report PDF (extends existing `export.py` endpoint)

### Job Match Preservation

- [ ] **JOBMATCH-01**: `compare.py` endpoint, job match task, and all job match data models remain unchanged and fully functional in v4.0
- [ ] **JOBMATCH-02**: `job.jd_role_id → JobRole` linkage documented and preserved as the anchor for future "job finding" feature

## Traceability v4.0

### Phase 13: PDF Workspace Foundation

| Requirement | Description | Status |
|-------------|-------------|--------|
| PDF-01 | react-pdf v10 with text layer | Complete |
| PDF-02 | GET /jobs/{id}/file endpoint | Complete |
| PDF-03 | Defaults to optimized view | Complete |
| LAYOUT-01 | 3-panel workspace layout shell | Complete |
| LAYOUT-02 | /workspace-v2/[job_id] parallel route | Complete |
| CRDT-01 | Yjs Y.Doc + y-indexeddb | Complete |
| CRDT-03 | cv_document JSONB column | Complete |

### Phase 14: Annotation System + Diff Toggle

| Requirement | Description | Status |
|-------------|-------------|--------|
| ANNOT-01 | Stabilo overlays via customTextRenderer | Pending |
| ANNOT-02 | 1.5s hover → Apply/Dismiss popover | Pending |
| ANNOT-03 | Hover syncs left panel | Pending |
| ANNOT-04 | suggestion_anchors JSONB column | Pending |
| PDF-04 | Diff toggle (original ↔ optimized) | Pending |
| LAYOUT-03 | Sticky action footer | Pending |

### Phase 15: Left Panel + Inline AI Edit

| Requirement | Description | Status |
|-------------|-------------|--------|
| INLINE-01 | Text selection → Edit with AI popover | Pending |
| INLINE-02 | Prompt → preview → apply rewrite | Pending |
| INLINE-03 | Backend inline AI rewrite endpoint | Pending |

### Phase 16: Live Chat + CRDT Backend

| Requirement | Description | Status |
|-------------|-------------|--------|
| CHAT-01 | Live chat panel in right rail | Pending |
| CHAT-02 | Chat streaming via fetch + ReadableStream | Pending |
| CHAT-03 | System context injection for chat | Pending |
| CRDT-02 | pycrdt-websocket WebSocket endpoint | Pending |

### Phase 17: Export + Migration Cutover

| Requirement | Description | Status |
|-------------|-------------|--------|
| EXPV4-01 | Save optimized PDF (WeasyPrint) | Complete |
| EXPV4-02 | Save report (extends existing) | Complete |
| LAYOUT-02 | Upload flow redirected to /workspace-v2 | Complete |
| JOBMATCH-01 | compare.py unchanged, fully functional | Pending |
| JOBMATCH-02 | job.jd_role_id linkage preserved | Pending |
