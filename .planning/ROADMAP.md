### Phase 17: Export v4, Migration Cutover & Job Match Preservation

**Goal**: Users can export the optimized CV as a polished PDF and a full analysis report; the upload flow now lands in `/workspace-v2`; all job match features are verified unchanged and the `jd_role_id` linkage is documented.

**Depends on**: Phase 16 (Live Chat & CRDT Foundation)

**Requirements**: EXPV4-01, EXPV4-02, LAYOUT-02, JOBMATCH-01, JOBMATCH-02

**Success Criteria** (what must be TRUE):
  1. Clicking "Save Optimized PDF" generates and downloads a formatted PDF built from the current `cv_document` JSONB via WeasyPrint + Jinja2 template
  2. Clicking "Save Report" downloads an analysis report PDF (extends existing `export.py`; no regression on v1 export)
  3. Completing a new CV upload redirects to `/workspace-v2/{job_id}` instead of `/workspace/{job_id}`; visiting the old URL redirects transparently
  4. `POST /jobs/{id}/compare`, SSE streaming, comparison result display, and all job match data are fully functional — zero regression
  5. `job.jd_role_id → JobRole` relationship is documented in code comments as the "job finding" feature anchor; `canvas/` directory retired after redirect verification

**Waves:** 2

**Deliverables:**
- `POST /api/v1/jobs/{id}/export/optimized` endpoint: renders `cv_document` JSONB → Jinja2 HTML template → WeasyPrint PDF → streaming download
- Save Report: extend `export.py` with v4.0 context (scores, suggestions, inline edits applied); reuse existing WeasyPrint pipeline
- Migration cutover: update `job-routes.ts` `getWorkspaceRoute()` to `/workspace-v2/{id}`; add `redirect()` in `app/workspace/[job_id]/page.tsx`
- Job match regression test pass: `compare.py`, `compare_cv_task`, `JobRole` model, `comparison_result` schema all confirmed unchanged
- Code comments on `job.jd_role_id → JobRole` FK; `app/workspace/` directory deletion after cutover smoke test passes

**Plans**: 2 plans across 2 waves

Plans:
- [x] 17-01-PLAN.md — PDF export infrastructure: optimized CV template, export endpoint, extended analysis report (Wave 1)
- [ ] 17-02-PLAN.md — Upload flow cutover, legacy redirect, job match verification, directory cleanup (Wave 2)

**UI hint**: yes
