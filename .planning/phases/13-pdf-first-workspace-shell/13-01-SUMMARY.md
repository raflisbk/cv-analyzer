---
phase: 13-pdf-first-workspace-shell
plan: "01"
subsystem: frontend
tags: [utility-extraction, refactor, packages, workspace-v2, phase-13]
dependency_graph:
  requires: []
  provides:
    - frontend/lib/workspace-utils.ts
  affects:
    - frontend/components/workspace/canvas/canvas-editor.tsx
    - frontend/components/workspace/canvas/section-block.tsx
tech_stack:
  added:
    - react-pdf@10.4.1
    - yjs@13.6.30
    - y-indexeddb@9.0.12
    - zustand@5.0.12
    - "@floating-ui/react@0.27.19"
  patterns:
    - Shared utility module pattern — satu sumber kebenaran untuk fungsi yang dipakai oleh dua workspace
    - Re-export pattern — section-block.tsx re-exports plainTextToTiptapDoc dari workspace-utils untuk backward compatibility
key_files:
  created:
    - frontend/lib/workspace-utils.ts
  modified:
    - frontend/components/workspace/canvas/canvas-editor.tsx
    - frontend/components/workspace/canvas/section-block.tsx
    - frontend/package.json
    - frontend/package-lock.json
decisions:
  - Re-export plainTextToTiptapDoc dari section-block.tsx untuk menjaga backward compatibility dengan kode yang mungkin sudah mengimport dari sana
  - Import + re-export pattern (bukan hanya re-export) karena section-block.tsx juga memakai fungsi tersebut secara internal
  - Hapus unused SuggestionItem import dari canvas-editor.tsx setelah normalizeSuggestion dipindah ke workspace-utils
metrics:
  duration: "12 minutes"
  completed: "2026-04-14"
  tasks_completed: 2
  files_modified: 5
---

# Phase 13 Plan 01: Utility Extraction & Package Setup Summary

**One-liner:** Ekstrak `plainTextToTiptapDoc`, `normalizeSuggestion`, `buildInitialSections` dari canvas ke `lib/workspace-utils.ts` lalu install 5 package Phase 13 (react-pdf, yjs, y-indexeddb, zustand, @floating-ui/react).

## Tasks Completed

| Task | Deskripsi | Commit | Files |
|------|-----------|--------|-------|
| 1 | Ekstrak utility functions ke workspace-utils.ts, update imports di canvas files | `7665183` | `frontend/lib/workspace-utils.ts` (create), `canvas-editor.tsx` (modify), `section-block.tsx` (modify) |
| 2 | Install 5 frontend packages untuk Phase 13 | `448f813` | `frontend/package.json`, `frontend/package-lock.json` |

## Fungsi yang Diekstrak

### Sumber → Tujuan

| Fungsi | Sumber asal | Tujuan |
|--------|------------|--------|
| `plainTextToTiptapDoc` | `section-block.tsx` (baris 38-47) | `lib/workspace-utils.ts` |
| `normalizeSuggestion` | `canvas-editor.tsx` (baris 24-36) | `lib/workspace-utils.ts` |
| `buildInitialSections` | `canvas-editor.tsx` (baris 38-54) | `lib/workspace-utils.ts` |
| `SpacingValue` type | `canvas-editor.tsx` + `section-block.tsx` | `lib/workspace-utils.ts` |
| `SectionState` interface | `canvas-editor.tsx` | `lib/workspace-utils.ts` |

### Perubahan Signature

**Tidak ada perubahan signature.** Semua 3 fungsi di-copy verbatim dari source file ke workspace-utils.ts. Logic, parameter, dan return type identik.

## Perubahan per File

### `frontend/lib/workspace-utils.ts` (BARU)
- Export `SpacingValue` type, `SectionState` interface
- Export `plainTextToTiptapDoc(text: string): JSONContent`
- Export `normalizeSuggestion(raw: Record<string, unknown>): SuggestionItem`
- Export `buildInitialSections(sections, draftContent?): SectionState[]`

### `frontend/components/workspace/canvas/canvas-editor.tsx`
- **Dihapus:** definisi lokal `SpacingValue`, `SectionState`, `normalizeSuggestion`, `buildInitialSections`
- **Dihapus:** unused import `SuggestionItem` dan `plainTextToTiptapDoc` dari `./section-block`
- **Ditambah:** `import { normalizeSuggestion, buildInitialSections, type SectionState, type SpacingValue } from "@/lib/workspace-utils"`

### `frontend/components/workspace/canvas/section-block.tsx`
- **Dihapus:** definisi lokal `export function plainTextToTiptapDoc`, `type SpacingValue`
- **Ditambah:** `import { plainTextToTiptapDoc, type SpacingValue } from "@/lib/workspace-utils"`
- **Ditambah:** `export { plainTextToTiptapDoc } from "@/lib/workspace-utils"` — re-export untuk backward compatibility

## Package yang Terinstall

| Package | Versi | Kegunaan |
|---------|-------|----------|
| `react-pdf` | `^10.4.1` | PDF viewer (bundles pdfjs-dist 5.x, SSR-safe via dynamic import) |
| `yjs` | `^13.6.30` | CRDT state management untuk real-time workspace |
| `y-indexeddb` | `^9.0.12` | IndexedDB persistence provider untuk Yjs |
| `zustand` | `^5.0.12` | Lightweight state management untuk workspace-v2 store |
| `@floating-ui/react` | `^0.27.19` | Positioning engine untuk suggestion anchor popovers |

**Catatan install:**
- npm install exit code 0 — tidak ada error fatal
- Satu warning pre-existing: `eslint-visitor-keys@5.0.1` membutuhkan Node.js `^20.19.0 || ^22.13.0` (runtime saat ini: v22.12.0) — bukan dari package yang diinstall
- High severity vulnerability bersifat pre-existing (bukan dari package baru ini)
- React 19 compatibility: react-pdf v10 mendukung React `^16.8 || ^17 || ^18 || ^19`, zustand v5 mendukung React 19 ✓

## Hasil Verifikasi

```
npx tsc --noEmit → exit code 0 (PASS)
grep "export function" workspace-utils.ts → 3 fungsi (PASS)
canvas-editor.tsx tidak mendefinisikan normalizeSuggestion → OK (PASS)
canvas-editor.tsx tidak mendefinisikan buildInitialSections → OK (PASS)
section-block.tsx mengimport dari workspace-utils → OK (PASS)
section-block.tsx tidak mendefinisikan plainTextToTiptapDoc lokal → OK (PASS)
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Duplikasi interface SectionBlockProps saat edit**
- **Ditemukan saat:** Task 1 — edit kedua ke section-block.tsx
- **Issue:** Edit pertama berhasil, tapi edit kedua untuk menghapus fungsi `plainTextToTiptapDoc` secara tidak sengaja menghasilkan `interface SectionBlockProps {function findTextRange(` yang merupakan syntax invalid
- **Fix:** Perbaiki baris 37 dengan mengganti `interface SectionBlockProps {function findTextRange(` dengan `// ─── Stabilo highlight utilities ────────────────────────────────────────────\n\nfunction findTextRange(`
- **Files modified:** `section-block.tsx`
- **Tidak memerlukan commit terpisah** karena diperbaiki sebelum TypeScript check dan commit

**2. [Rule 2 - Cleanup] Hapus unused SuggestionItem import dari canvas-editor.tsx**
- **Ditemukan saat:** Task 1 — setelah `normalizeSuggestion` dipindah ke workspace-utils, `import type { SuggestionItem }` di canvas-editor.tsx menjadi unused
- **Fix:** Dihapus unused import untuk menjaga code clean (TypeScript strict mode akan error jika ada unused imports)
- **Files modified:** `canvas-editor.tsx`

## Known Stubs

Tidak ada stubs — plan ini adalah refactoring dan package install, tidak ada UI components baru atau data wiring.

## Threat Flags

Tidak ada surface baru yang diintroduksi — ini adalah refactoring murni (pemindahan fungsi) dan package install.

## Self-Check: PASSED

- `frontend/lib/workspace-utils.ts` → FOUND ✓
- Commit `7665183` → FOUND ✓  
- Commit `448f813` → FOUND ✓
- `tsc --noEmit` exit code 0 → VERIFIED ✓
- 3 fungsi exported dari workspace-utils → VERIFIED ✓
- Package.json mengandung semua 5 package baru → VERIFIED ✓
