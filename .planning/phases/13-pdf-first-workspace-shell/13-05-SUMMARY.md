---
phase: 13-pdf-first-workspace-shell
plan: "05"
subsystem: frontend
tags: [workspace-v2, shell, left-panel, right-rail, skeleton, zustand, react-pdf, phase-13]
dependency_graph:
  requires: [13-02, 13-03, 13-04]
  provides:
    - frontend/components/workspace-v2/left-detail-panel.tsx
    - frontend/components/workspace-v2/left-panel-toggle.tsx
    - frontend/components/workspace-v2/right-rail-stats.tsx
    - frontend/components/workspace-v2/workspace-skeleton.tsx
  affects:
    - frontend/components/workspace-v2/shell.tsx
    - frontend/app/workspace-v2/[job_id]/page.tsx
    - frontend/app/workspace-v2/[job_id]/loading.tsx
    - frontend/lib/workspace.ts
tech_stack:
  added: []
  patterns:
    - "Promise.allSettled untuk parallel fetch yang graceful — tidak crash jika salah satu gagal"
    - "Zustand store initialization via useEffect — store di-seed dari server-fetched hydration"
    - "44px touch target via before:inset-[-8px] CSS pseudo-element — mobile accessibility"
    - "WorkspaceSkeleton menggunakan raw Tailwind values (#111111, #1A1A1A) — tidak perlu CSS vars aktif"
key_files:
  created:
    - frontend/components/workspace-v2/left-detail-panel.tsx
    - frontend/components/workspace-v2/left-panel-toggle.tsx
    - frontend/components/workspace-v2/right-rail-stats.tsx
    - frontend/components/workspace-v2/workspace-skeleton.tsx
  modified:
    - frontend/components/workspace-v2/shell.tsx
    - frontend/app/workspace-v2/[job_id]/page.tsx
    - frontend/app/workspace-v2/[job_id]/loading.tsx
    - frontend/lib/workspace.ts
decisions:
  - "grammarCount = 0 stub intentional — grammar_issues tidak ada di WorkspaceAnalysisContext Phase 13; akan ditambahkan Phase 15"
  - "WorkspaceSkeleton menggunakan hard-coded hex (#111111, #1A1A1A) bukan CSS vars — loading.tsx merender sebelum [data-workspace-v2] aktif, sehingga vars tidak tersedia"
  - "Promise.allSettled pada page.tsx — T-13-05-02 mitigated: fetch failure tidak crash halaman"
  - "left panel toggle hidden di mobile (hidden lg:block) — sesuai CONTEXT.md D-03: mobile = PDF only"
metrics:
  duration: "15 minutes"
  completed: "2026-04-14"
  tasks_completed: 2
  files_modified: 8
requirements:
  - LAYOUT-01
  - PDF-02
  - PDF-03
---

# Phase 13 Plan 05: Workspace Panel Components Summary

**One-liner:** Empat workspace-v2 components baru (LeftDetailPanel 4 stub tabs, LeftPanelToggle 44px touch target, RightRailStats score 32px lime, WorkspaceSkeleton 3-panel pulse), shell.tsx fully wired, page.tsx paralel fetch dengan `Promise.allSettled`, loading.tsx menggunakan WorkspaceSkeleton — workspace-v2 route sekarang fully operational.

## Tasks Completed

| Task | Deskripsi | Commit | Files |
|------|-----------|--------|-------|
| 1 | LeftDetailPanel, LeftPanelToggle, RightRailStats, WorkspaceSkeleton | `6e6dfbb` | left-detail-panel.tsx, left-panel-toggle.tsx, right-rail-stats.tsx, workspace-skeleton.tsx (create) |
| 2 | Wire shell.tsx + update page.tsx, loading.tsx, lib/workspace.ts | `03d29ed` | shell.tsx, page.tsx, loading.tsx, workspace.ts (modify) |

## Deliverables

### 1. left-detail-panel.tsx — Left Panel Stub Tabs

**File:** `frontend/components/workspace-v2/left-detail-panel.tsx`

- `"use client"` + `useState<TabId>` untuk active tab state
- **4 tabs:** Ringkasan, Skor, Saran AI, Tata Bahasa
- Tab buttons: `rounded-full`, `bg-[--ws-surface-active]` untuk active, `border border-[--ws-border]` untuk inactive
- Tab content: placeholder "Detail analisis tersedia setelah proses selesai. Panel ini akan diisi pada Fase 15."
- Panel header: "Detail Analisis" 15px font-bold

### 2. left-panel-toggle.tsx — Toggle Button

**File:** `frontend/components/workspace-v2/left-panel-toggle.tsx`

- `"use client"` — menggunakan `useWorkspaceV2Store`
- **Visual size:** 28×28px (`h-7 w-7`)
- **Touch target:** 44×44px via `before:absolute before:inset-[-8px] before:content-['']`
- **aria-expanded:** terhubung ke `leftPanelOpen` dari store
- **aria-label:** "Tutup detail panel" / "Buka detail panel" (Indonesian)
- **Icon:** `ChevronLeft` (expanded) / `ChevronRight` (collapsed) — 14px

### 3. right-rail-stats.tsx — Summary Stats Panel

**File:** `frontend/components/workspace-v2/right-rail-stats.tsx`

- `"use client"` — menggunakan `useWorkspaceV2Store`
- **Panel title:** "Ringkasan" 15px font-bold
- **Score card:** `bg-[--ws-surface-active]`, `border-[--ws-border-accent]`, score `text-[32px] font-bold text-[--ws-accent]`
- **Suggestion count:** `analysis.suggestions.flatMap(card => card.suggestions).length`
- **Grammar count:** `0` stub — intentional, `grammar_issues` tidak ada di `WorkspaceAnalysisContext` Phase 13
- **Chat stub:** "Asisten chat segera hadir" centered, muted
- **Stat rows:** `Lightbulb` icon untuk saran, `FileText` untuk grammar

### 4. workspace-skeleton.tsx — Full 3-Panel Skeleton

**File:** `frontend/components/workspace-v2/workspace-skeleton.tsx`

- `data-workspace-v2` + `aria-busy="true"` + `aria-live="polite"`
- **Header skeleton:** 3 pulse bars sesuai actual header structure
- **Left column skeleton:** hidden mobile, `w-[290px]`, 3 pulse bars
- **Center column skeleton:** `max-w-[860px] min-h-[400px] animate-pulse rounded-2xl` — A4-like shape
- **Right column skeleton:** hidden mobile, `w-[340px]`, 4 pulse bars termasuk score card shape
- Raw hex values (`#111111`, `#1A1A1A`, `#222222`) — bukan CSS vars, karena loading.tsx merender sebelum vars aktif

### 5. shell.tsx — Fully Wired Shell

**File:** `frontend/components/workspace-v2/shell.tsx`

Perubahan dari versi Plan 03:
- **Tambah `initialPdfUrl` prop** → `setPdfUrl(initialPdfUrl)` di useEffect
- **Left aside:** `<LeftDetailPanel className="h-full" />` — placeholder diganti
- **Center main:** `<LeftPanelToggle />` (absolute toggle) + `<PdfViewerPanel pdfUrl={pdfUrl} />` — placeholder diganti
- **Right aside:** `<RightRailStats className="h-full" />` — placeholder diganti
- **Toggle positioning:** `absolute left-0 top-1/2 z-10 -translate-y-1/2 hidden lg:block`

### 6. page.tsx — Parallel Fetch

**File:** `frontend/app/workspace-v2/[job_id]/page.tsx`

- `Promise.allSettled([getWorkspaceHydration, getJobFileUrl])` — kedua fetch paralel
- Null fallback: jika fetch gagal → `null` (tidak crash)
- `initialPdfUrl={pdfUrl}` diteruskan ke `WorkspaceV2Shell`

### 7. loading.tsx — WorkspaceSkeleton

**File:** `frontend/app/workspace-v2/[job_id]/loading.tsx`

```tsx
import { WorkspaceSkeleton } from "@/components/workspace-v2/workspace-skeleton";
export default function WorkspaceV2Loading() {
  return <WorkspaceSkeleton />;
}
```

### 8. lib/workspace.ts — getJobFileUrl

**File:** `frontend/lib/workspace.ts`

```typescript
export interface WorkspaceFileUrl {
  file_url: string;
  expires_in: number;
}
export async function getJobFileUrl(jobId: string): Promise<WorkspaceFileUrl> {
  return apiFetch<WorkspaceFileUrl>(`/jobs/${jobId}/file`);
}
```

## Verification Results

```
tsc --noEmit → exit code 0 ✓

# Task 1 Acceptance Criteria
left-detail-panel.tsx: Detail Analisis         ✓ FOUND (line 31)
left-detail-panel.tsx: 4 tab labels            ✓ FOUND (lines 13-16)
left-detail-panel.tsx: Fase 15 stub copy       ✓ FOUND (line 57)
left-panel-toggle.tsx: aria-expanded           ✓ FOUND (line 23)
left-panel-toggle.tsx: aria-label Indonesian   ✓ FOUND (line 22)
left-panel-toggle.tsx: toggleLeftPanel         ✓ FOUND (lines 17, 21)
left-panel-toggle.tsx: 44px touch target       ✓ FOUND (line 32)
right-rail-stats.tsx: Ringkasan                ✓ FOUND (line 42)
right-rail-stats.tsx: Skor Keseluruhan         ✓ FOUND (lines 48, 51)
right-rail-stats.tsx: text-[32px] font-bold    ✓ FOUND (line 54)
right-rail-stats.tsx: saran perbaikan          ✓ FOUND (line 75)
right-rail-stats.tsx: isu tata bahasa          ✓ FOUND (line 91)
right-rail-stats.tsx: Asisten chat segera hadir ✓ FOUND (line 101)
workspace-skeleton.tsx: animate-pulse (10x)    ✓ FOUND (>= 5 required)
workspace-skeleton.tsx: data-workspace-v2      ✓ FOUND (line 10)

# Task 2 Acceptance Criteria
workspace.ts: getJobFileUrl exported           ✓ FOUND (line 59)
workspace.ts: WorkspaceFileUrl interface       ✓ FOUND (line 54)
page.tsx: getJobFileUrl imported+used         ✓ FOUND (lines 1, 14)
page.tsx: Promise.allSettled                  ✓ FOUND (line 12)
shell.tsx: initialPdfUrl prop                 ✓ FOUND (lines 15, 21, 30, 31)
shell.tsx: PdfViewerPanel rendered            ✓ FOUND (lines 8, 79)
shell.tsx: LeftDetailPanel rendered           ✓ FOUND (lines 6, 68)
shell.tsx: LeftPanelToggle rendered           ✓ FOUND (lines 7, 75)
shell.tsx: RightRailStats rendered            ✓ FOUND (lines 9, 84)
loading.tsx: WorkspaceSkeleton used           ✓ FOUND (lines 1, 4)
```

## Deviations from Plan

### Auto-fixed Issues

Tidak ada deviasi — plan dieksekusi sesuai spesifikasi.

**Catatan:** `grammarCount = 0` adalah stub intentional per CONTEXT.md D-02 dan catatan plan — `grammar_issues` belum ada di `WorkspaceAnalysisContext`, akan ditambahkan Phase 15.

## Known Stubs

| Stub | File | Alasan |
|------|------|--------|
| `grammarCount = 0` | right-rail-stats.tsx:29 | `grammar_issues` tidak ada di `WorkspaceAnalysisContext` Phase 13; Phase 15 akan menambahkan field dan wiring |
| 4 tab content placeholder | left-detail-panel.tsx:54-59 | Tab content wiring ke analysis data adalah Phase 15 scope |

Stubs di atas adalah intentional — Phase 13 scope adalah panel UI skeleton, bukan data wiring.

## Threat Model Compliance

| Threat ID | Status |
|-----------|--------|
| T-13-05-01 | ✅ Accept — pdfUrl adalah presigned URL dengan expiry; disimpan di Zustand memory saja, bukan LocalStorage |
| T-13-05-02 | ✅ Mitigated — `Promise.allSettled` tidak throw; null pdfUrl = "PDF tidak tersedia" gracefully |
| T-13-05-03 | ✅ Accept — LeftPanelToggle hanya mengubah `leftPanelOpen` boolean di Zustand; tidak ada data mutation |

## Self-Check: PASSED

- [x] `frontend/components/workspace-v2/left-detail-panel.tsx` → EXISTS ✓
- [x] `frontend/components/workspace-v2/left-panel-toggle.tsx` → EXISTS ✓
- [x] `frontend/components/workspace-v2/right-rail-stats.tsx` → EXISTS ✓
- [x] `frontend/components/workspace-v2/workspace-skeleton.tsx` → EXISTS ✓
- [x] `frontend/components/workspace-v2/shell.tsx` (modified) → EXISTS ✓
- [x] `frontend/app/workspace-v2/[job_id]/page.tsx` (modified) → EXISTS ✓
- [x] `frontend/app/workspace-v2/[job_id]/loading.tsx` (modified) → EXISTS ✓
- [x] `frontend/lib/workspace.ts` (modified) → EXISTS ✓
- [x] Commit `6e6dfbb` → EXISTS ✓
- [x] Commit `03d29ed` → EXISTS ✓
- [x] `tsc --noEmit` exit code 0 → VERIFIED ✓
- [x] `getJobFileUrl` exported from workspace.ts → VERIFIED ✓
- [x] `Promise.allSettled` in page.tsx → VERIFIED ✓
- [x] `LeftDetailPanel` + `LeftPanelToggle` + `PdfViewerPanel` + `RightRailStats` in shell.tsx → VERIFIED ✓
- [x] `WorkspaceSkeleton` in loading.tsx → VERIFIED ✓
