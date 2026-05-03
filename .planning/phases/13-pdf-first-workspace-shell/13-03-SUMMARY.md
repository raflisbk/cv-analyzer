---
phase: 13-pdf-first-workspace-shell
plan: "03"
subsystem: frontend
tags: [workspace-v2, shell, css-variables, zustand, next-app-router, phase-13]
dependency_graph:
  requires: [13-01]
  provides:
    - frontend/lib/stores/workspace-v2-store.ts
    - frontend/app/workspace-v2/[job_id]/page.tsx
    - frontend/components/workspace-v2/shell.tsx
    - frontend/components/workspace-v2/header.tsx
  affects:
    - frontend/app/globals.css
tech_stack:
  added:
    - zustand (v5.0.12, terinstall di Plan 01)
  patterns:
    - CSS custom properties scoped ke [data-workspace-v2] — zero bleed ke landing page
    - Zustand minimal store pattern (no persist middleware, Yjs handles persistence)
    - Next.js App Router Server Component pattern — page.tsx fetch hydration, shell.tsx client component
key_files:
  created:
    - frontend/lib/stores/workspace-v2-store.ts
    - frontend/app/workspace-v2/[job_id]/layout.tsx
    - frontend/app/workspace-v2/[job_id]/loading.tsx
    - frontend/app/workspace-v2/[job_id]/page.tsx
    - frontend/components/workspace-v2/shell.tsx
    - frontend/components/workspace-v2/header.tsx
  modified:
    - frontend/app/globals.css
decisions:
  - "CSS vars scoped ke [data-workspace-v2] attribute selector — tidak override :root global vars landing page"
  - "Zustand store tanpa persist middleware — Yjs menangani persistence di Phase 14+"
  - "loading.tsx menggunakan div placeholder (bukan WorkspaceV2Skeleton yang belum ada di Plan 05)"
  - "Server Component page.tsx + Client Component shell.tsx — standard Next.js pattern untuk hydration"
metrics:
  duration: "15 minutes"
  completed: "2026-04-12"
  tasks_completed: 2
  files_modified: 7
---

# Phase 13 Plan 03: Workspace-v2 Shell Foundation Summary

**One-liner:** CSS custom properties 15 token workspace-v2 scoped ke `[data-workspace-v2]`, Zustand store minimal dengan `leftPanelOpen: false` dan `viewMode: 'optimized'`, dan route Next.js App Router `/workspace-v2/[job_id]` dengan 3-panel grid skeleton yang bisa dinavigasi.

## Tasks Completed

| Task | Deskripsi | Commit | Files |
|------|-----------|--------|-------|
| 1 | CSS variables di globals.css + Zustand store workspace-v2 | `292e3b9` | globals.css (modify), workspace-v2-store.ts (create) |
| 2 | Route workspace-v2 layout/loading/page + WorkspaceV2Shell + WorkspaceV2Header | `066083d` | layout.tsx, loading.tsx, page.tsx, shell.tsx, header.tsx (create) |

## Deliverables

### 1. CSS Custom Properties — [data-workspace-v2]

**File:** `frontend/app/globals.css`

15 token CSS ditambahkan di bawah `@layer base`, scoped ke `[data-workspace-v2]` attribute selector:

| Token | Nilai | Fungsi |
|-------|-------|--------|
| `--ws-bg` | `#111111` | Shell background (60% dominant) |
| `--ws-surface` | `#1A1A1A` | Panel backgrounds (30% secondary) |
| `--ws-surface-hover` | `#222222` | Hover state |
| `--ws-surface-active` | `#282828` | Pressed/selected |
| `--ws-border` | `rgba(255,255,255,0.07)` | Default panel borders |
| `--ws-border-accent` | `rgba(202,255,67,0.14)` | Lime-tinted border |
| `--ws-border-strong` | `rgba(255,255,255,0.13)` | Header bottom, focus rings |
| `--ws-paper` | `#FFFDF4` | PDF paper background |
| `--ws-paper-shadow` | `0 8px 48px rgba(0,0,0,0.65)` | PDF drop shadow |
| `--ws-ink` | `#F5F2D8` | Primary text |
| `--ws-ink-secondary` | `rgba(245,242,216,0.65)` | Secondary text |
| `--ws-ink-ghost` | `rgba(245,242,216,0.35)` | Placeholder text |
| `--ws-accent` | `#CAFF43` | Lime accent color |
| `--ws-accent-fg` | `#111111` | Text on accent background |
| `--ws-accent-muted` | `rgba(202,255,67,0.12)` | Accent background subtle |
| `--ws-destructive` | `hsl(0 84.2% 60.2%)` | Error/destructive color |

**Scoping:** Semua vars hanya aktif di dalam elemen dengan `data-workspace-v2` attribute — landing page tidak terpengaruh.

### 2. Zustand Store — useWorkspaceV2Store

**File:** `frontend/lib/stores/workspace-v2-store.ts`

```typescript
// State
pdfUrl: null               // URL PDF presigned untuk react-pdf
viewMode: "optimized"      // PDF-03: default optimized view
leftPanelOpen: false       // D-01: collapsed by default
jobId: ""                  // Job UUID dari URL params
hydration: null            // WorkspaceHydration dari backend

// Actions
setPdfUrl, setViewMode, toggleLeftPanel, setJobId, setHydration
```

**Design decisions:**
- Tidak menggunakan `persist` middleware — Yjs `y-indexeddb` menangani persistence
- Type `WorkspaceHydration` diimport dari `@/lib/workspace` (sudah ada)
- `viewMode: "optimized"` sesuai CONTEXT.md D-02 (optimized default, bukan original)

### 3. Route workspace-v2

#### `layout.tsx`
- Import `react-pdf/dist/Page/TextLayer.css` dan `AnnotationLayer.css`
- Metadata: `title: "Analisis CV | CV Analyzer"`
- Wrapper fragment pass-through — tidak ada layout nesting

#### `loading.tsx`
- Placeholder div dengan `data-workspace-v2`, `aria-busy="true"`, `aria-live="polite"`
- Background `#111111` konsisten dengan shell
- Teks Indonesia: "Memuat ruang kerja..."

#### `page.tsx`
- Server Component async
- `params: Promise<{ job_id: string }>` — Next.js 15 async params pattern
- `getWorkspaceHydration(job_id).catch(() => null)` — null hydration = graceful empty state (T-13-03-01 mitigated)
- Render `WorkspaceV2Shell` dengan hydration + jobId

### 4. WorkspaceV2Shell

**File:** `frontend/components/workspace-v2/shell.tsx`

- `"use client"` — menggunakan Zustand dan useEffect
- Root div: `data-workspace-v2` + `flex h-screen flex-col overflow-hidden`
- `useEffect` inisialisasi store dengan jobId + hydration dari server
- **3-panel grid** desktop: `lg:grid-cols-[290px_minmax(0,1fr)_340px]`
- Transition grid template saat `leftPanelOpen` toggle (200ms ease-in-out)
- Left panel: `hidden lg:flex`, collapsed default (`w-0 opacity-0 pointer-events-none`)
- Center main: placeholder "PDF viewer sedang disiapkan..."
- Right rail: `hidden lg:flex`, `w-[340px]`
- Mobile: single column (semua aside `hidden` di mobile)

### 5. WorkspaceV2Header

**File:** `frontend/components/workspace-v2/header.tsx`

- `"use client"` — menggunakan `useRouter`
- **Tombol Kembali:** `router.push(/results/${jobId})`, teks "Kembali" + ChevronLeft icon
- **Divider:** `h-4 w-px` separator
- **Filename:** `truncate` + `max-width: 360px`, fallback "Dokumen"
- **Status badge:** Tampil hanya jika `jobStatus === "ready"`, teks "Selesai", style lime accent

## Verification Results

```
[data-workspace-v2] present: true    ✓
--ws-bg present: true                 ✓
--ws-accent present: true             ✓
--ws-paper present: true              ✓
useWorkspaceV2Store exported          ✓
leftPanelOpen: false default          ✓
viewMode: "optimized" default         ✓
toggleLeftPanel action exported       ✓
layout.tsx: TextLayer.css imported    ✓
page.tsx: WorkspaceV2Shell rendered   ✓
shell.tsx: data-workspace-v2 present  ✓
shell.tsx: lg:grid-cols-[290px found  ✓
shell.tsx: hidden lg:flex (2x)        ✓
header.tsx: Kembali text              ✓
header.tsx: ChevronLeft icon          ✓
header.tsx: Selesai badge             ✓
header.tsx: Dokumen fallback          ✓
tsc --noEmit → exit 0                 ✓
```

## Deviations from Plan

### Auto-fixed Issues

Tidak ada deviasi — plan dieksekusi sesuai spesifikasi.

**Catatan konteks:** Plan 06 (Annotation Spike) sudah membuat `frontend/components/workspace-v2/` directory dengan `pdf-viewer-inner.tsx`, `pdf-viewer-skeleton.tsx`, `pdf-viewer-error.tsx` sebelum Plan 03 ini dieksekusi (sebagai Rule 3 deviation di Plan 06). Oleh karena itu Plan 03 ini cukup menambahkan `shell.tsx` dan `header.tsx` ke direktori yang sudah ada — tidak perlu buat direktori baru.

## Known Stubs

| Stub | File | Alasan |
|------|------|--------|
| Left panel kosong | shell.tsx:54 | `LeftDetailPanel` akan dibuat Plan 05 |
| Center panel placeholder | shell.tsx:65-70 | `PdfViewerPanel` akan dibuat Plan 04/05 |
| Right rail kosong | shell.tsx:75 | `RightRailStats` akan dibuat Plan 05 |

Stubs di atas adalah intentional — Plan 03 scope adalah skeleton shell, bukan konten panels.

## Threat Model Compliance

| Threat ID | Status |
|-----------|--------|
| T-13-03-01 | ✅ Mitigated — `getWorkspaceHydration().catch(() => null)` — null hydration = graceful empty state |
| T-13-03-02 | ✅ Mitigated — Vars scoped ke `[data-workspace-v2]`, tidak override `:root` global vars |
| T-13-03-03 | ✅ Accept — Store diinisialisasi dari server-fetched hydration; tidak ada user-controlled input path |

## Self-Check: PASSED

- [x] `frontend/app/globals.css` mengandung `[data-workspace-v2]` → EXISTS ✓
- [x] `frontend/lib/stores/workspace-v2-store.ts` → EXISTS ✓
- [x] `frontend/app/workspace-v2/[job_id]/layout.tsx` → EXISTS ✓
- [x] `frontend/app/workspace-v2/[job_id]/loading.tsx` → EXISTS ✓
- [x] `frontend/app/workspace-v2/[job_id]/page.tsx` → EXISTS ✓
- [x] `frontend/components/workspace-v2/shell.tsx` → EXISTS ✓
- [x] `frontend/components/workspace-v2/header.tsx` → EXISTS ✓
- [x] Commit `292e3b9` → EXISTS ✓
- [x] Commit `066083d` → EXISTS ✓
- [x] `tsc --noEmit` exit code 0 → VERIFIED ✓
- [x] 15+ CSS tokens di `[data-workspace-v2]` → VERIFIED ✓
- [x] `leftPanelOpen: false` di store → VERIFIED ✓
- [x] `viewMode: "optimized"` di store → VERIFIED ✓
