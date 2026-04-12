---
phase: 13-pdf-first-workspace-shell
plan: "06"
subsystem: frontend
tags: [annotation-spike, yjs, crdt, pdf-viewer, workspace-v2, phase-13]
dependency_graph:
  requires: [13-04]
  provides:
    - frontend/lib/annotation-utils.ts
    - frontend/hooks/use-workspace-doc.ts
    - frontend/components/workspace-v2/pdf-viewer-inner.tsx
    - .planning/phases/13-pdf-first-workspace-shell/annotation-spike-findings.md
  affects:
    - frontend/components/workspace-v2/pdf-viewer-inner.tsx
tech_stack:
  added: []
  patterns:
    - "as any cast dibatasi dalam function scope untuk mengakses pdfjs-dist API tanpa TypeScript types"
    - "useEffect pattern untuk SSR-safe Yjs initialization — y-indexeddb uses browser-only indexedDB global"
    - "useCallback untuk memoize async spike function agar tidak re-create tiap render"
key_files:
  created:
    - frontend/lib/annotation-utils.ts
    - frontend/hooks/use-workspace-doc.ts
    - frontend/components/workspace-v2/pdf-viewer-inner.tsx
    - frontend/components/workspace-v2/pdf-viewer-skeleton.tsx
    - frontend/components/workspace-v2/pdf-viewer-error.tsx
    - frontend/public/pdf.worker.min.mjs
    - .planning/phases/13-pdf-first-workspace-shell/annotation-spike-findings.md
  modified: []
decisions:
  - "type cast `as any` dibatasi dalam findTextRect function scope saja — tidak leak ke caller"
  - "getViewport({ scale: 1.0 }) untuk spike, bukan scale yang match containerWidth — Phase 14 tambah scale factor"
  - "useWorkspaceDoc return refs bukan state — menghindari re-render tiap kali doc/persistence diakses"
  - "workspace-v2 component files dibuat sebagai bagian deviation Rule 3 karena Plan 13-04 belum dieksekusi"
metrics:
  duration: "15 minutes"
  completed: "2026-04-14"
  tasks_completed: 2
  files_modified: 7
---

# Phase 13 Plan 06: Annotation Spike & Yjs Hook Summary

**One-liner:** `findTextRect` async function memetakan text substring ke PDF bounding rect via `pdfPage.getTextContent()` + `viewport.convertToViewportPoint()`, dan `useWorkspaceDoc` hook menginisialisasi Yjs Y.Doc + IndexeddbPersistence tanpa SSR crash — keduanya proof-of-concept untuk Phase 14 annotation overlay.

## Tasks Completed

| Task | Deskripsi | Commit | Files |
|------|-----------|--------|-------|
| 1 | annotation-utils.ts + use-workspace-doc.ts + pdf-viewer-inner.tsx dengan spike logging | `863fa00` | annotation-utils.ts (create), use-workspace-doc.ts (create), pdf-viewer-inner.tsx (create), pdf-viewer-skeleton.tsx (create), pdf-viewer-error.tsx (create), pdf.worker.min.mjs (copy) |
| 2 | Dokumentasi annotation-spike-findings.md | `c7211db` | annotation-spike-findings.md (create) |

## Deliverables

### 1. annotation-utils.ts

**File:** `frontend/lib/annotation-utils.ts`

**Exports:**
- `SuggestionAnchor` interface — data structure untuk PDF coordinate anchor
- `findTextRect(page, searchText, pageIndex, section)` — async function yang memetakan text → bounding rect

**Algorithm:**
```
1. page.getTextContent() → TextItem[]
2. Filter TextItem (bukan TextMarkedContent) → str.includes(searchText)
3. Ekstrak transform[4]=tx, transform[5]=ty (PDF bottom-up coords)
4. page.getViewport({ scale: 1.0 }) → viewport.convertToViewportPoint(tx, ty)
5. Adjust y: viewportY - item.height (top-left dari text item)
6. Return SuggestionAnchor { section, searchText, pageIndex, rect: {x,y,w,h} }
```

**Error handling:** try/catch menangkap semua errors dari getTextContent → return null (T-13-06-02 mitigated).

### 2. use-workspace-doc.ts

**File:** `frontend/hooks/use-workspace-doc.ts`

**Export:** `useWorkspaceDoc(jobId: string): { docRef, persistenceRef }`

**Pattern:**
- `"use client"` directive — tidak bisa diimport di Server Components
- `useEffect` untuk inisialisasi — tidak pernah berjalan di server
- IndexedDB key: `workspace-v2-{jobId}` — isolasi per job
- `persistence.on("synced", ...)` → log `[Yjs] IndexedDB synced untuk job: {jobId}`
- Cleanup: `persistence.destroy()` + `doc.destroy()` saat unmount

### 3. pdf-viewer-inner.tsx

**File:** `frontend/components/workspace-v2/pdf-viewer-inner.tsx`

**Tambahan annotation spike:**
- Import `findTextRect` dari `@/lib/annotation-utils`
- `runAnnotationSpike` callback: cari "Engineer" di halaman 1, log hasil ke console
- `<Page onLoadSuccess={runAnnotationSpike}>` — spike dipanggil setiap page load
- Setelah spike selesai, teruskan ke `onPageLoadSuccess?.()` parent callback

### 4. annotation-spike-findings.md

**File:** `.planning/phases/13-pdf-first-workspace-shell/annotation-spike-findings.md`

Dokumen 152 baris mencakup:
- Algoritma step-by-step dengan pseudocode
- Cara validasi di browser (DevTools Console)
- 4 known challenges: multi-item spans, coordinate system, scale dependency, case sensitivity
- Yjs CRDT-01 status dan SSR safety
- Rekomendasi konkret untuk Phase 14

## Verification Results

```
npx tsc --noEmit → exit code 0 (PASS)
grep "export interface SuggestionAnchor" annotation-utils.ts → line 17 (PASS)
grep "export async function findTextRect" annotation-utils.ts → line 45 (PASS)
grep "getTextContent" annotation-utils.ts → lines 9, 56 (PASS)
grep "convertToViewportPoint" annotation-utils.ts → lines 12, 76 (PASS)
grep "getViewport" annotation-utils.ts → line 57 (PASS)
grep "export function useWorkspaceDoc" use-workspace-doc.ts → line 32 (PASS)
grep "IndexeddbPersistence" use-workspace-doc.ts → lines 15, 19, 26, 34, 45 (PASS)
grep "workspace-v2-${jobId}" use-workspace-doc.ts → line 45 (PASS)
grep "Y.Doc" use-workspace-doc.ts → lines 18, 23, 26, 33, 39, 40 (PASS)
grep "persistence.destroy|doc.destroy" use-workspace-doc.ts → lines 54, 55 (PASS)
grep "findTextRect" pdf-viewer-inner.tsx → lines 8, 16, 60, 69 (PASS)
grep "Annotation Spike" pdf-viewer-inner.tsx → lines 8, 28, 59, 76, 79 (PASS)
annotation-spike-findings.md line count: 152 (> 50, PASS)
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Plan 13-04 belum dieksekusi — workspace-v2 direktori tidak ada**
- **Ditemukan saat:** Task 1 awal — `frontend/components/workspace-v2/` tidak ada di filesystem
- **Issue:** Plan 13-06 `depends_on: [13-04]`, tapi Plans 13-03, 13-04, 13-05 belum dieksekusi. pdf-viewer-inner.tsx yang harus di-update dari Plan 04 tidak ada.
- **Fix:** Buat workspace-v2 direktori + semua komponen yang diperlukan sebagai dependencies:
  - `pdf-viewer-skeleton.tsx` — shimmer loading state (konten dari Plan 04 spec)
  - `pdf-viewer-error.tsx` — error state role=alert + retry (konten dari Plan 04 spec)  
  - `pdf-viewer-inner.tsx` — react-pdf component dari Plan 04 spec, DITAMBAH annotation spike dari Plan 06
  - `frontend/public/pdf.worker.min.mjs` — copied dari `node_modules/pdfjs-dist/build/`
- **Files created:** pdf-viewer-inner.tsx, pdf-viewer-skeleton.tsx, pdf-viewer-error.tsx, pdf.worker.min.mjs
- **Commit:** 863fa00

**Note:** Plans 13-03, 13-04, 13-05 masih belum dieksekusi. Komponen yang dibuat di sini (skeleton, error) akan overlap dengan yang dibuat Plan 04 — Plan 04 perlu dieksekusi untuk melengkapi sisa workspace-v2 shell (pdf-viewer.tsx, pdf-viewer-panel.tsx, route, store, header, dll.).

## Known Stubs

| Stub | File | Alasan |
|------|------|--------|
| `const testSearchText = "Engineer"` | pdf-viewer-inner.tsx:66 | Hard-coded test string untuk spike; Phase 14 akan menggunakan searchText dari hydration.suggestions |
| Y.Doc tidak menyimpan data | use-workspace-doc.ts | Phase 13 hanya proof-of-concept CRDT init; data wiring di Phase 14+ |
| `charOffset: 0` | annotation-utils.ts:79 | Exact char offset computation untuk future use; Phase 14 |

Stubs di atas adalah intentional — Plan 13-06 scope adalah proof-of-concept, bukan production integration.

## Threat Model Compliance

| Threat ID | Status |
|-----------|--------|
| T-13-06-01 | ✅ Accept — console.log hanya development; koordinat bukan PII |
| T-13-06-02 | ✅ Mitigated — try/catch di findTextRect; return null pada failure |
| T-13-06-03 | ✅ Accept — IndexedDB scoped ke origin; no PII di Phase 13 |
| T-13-06-04 | ✅ Mitigated — `as any` hanya dalam function scope; eslint-disable eksplisit |

## Self-Check: PASSED

- [x] `frontend/lib/annotation-utils.ts` → EXISTS ✓
- [x] `frontend/hooks/use-workspace-doc.ts` → EXISTS ✓
- [x] `frontend/components/workspace-v2/pdf-viewer-inner.tsx` → EXISTS ✓
- [x] `.planning/phases/13-pdf-first-workspace-shell/annotation-spike-findings.md` → EXISTS ✓
- [x] Commit `863fa00` → EXISTS ✓
- [x] Commit `c7211db` → EXISTS ✓
- [x] `tsc --noEmit` exit code 0 → VERIFIED ✓
- [x] SuggestionAnchor interface exported → VERIFIED ✓
- [x] findTextRect function exported → VERIFIED ✓
- [x] useWorkspaceDoc function exported → VERIFIED ✓
- [x] IndexeddbPersistence usage → VERIFIED ✓
- [x] annotation-spike-findings.md 152 lines → VERIFIED ✓
