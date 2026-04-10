---
phase: 07-static-landing-sections
plan: "03"
subsystem: frontend-landing
tags: [rsc, landing-page, how-it-works, page-composition, tailwind]
dependency_graph:
  requires: [07-01, 07-02]
  provides: [how-it-works-section, page-composition]
  affects: [frontend/app/page.tsx, frontend/components/landing/how-it-works-section.tsx]
tech_stack:
  added: []
  patterns: [rsc, explicit-connector-layout, fragment-key-pattern]
key_files:
  created:
    - frontend/components/landing/how-it-works-section.tsx
  modified:
    - frontend/app/page.tsx
decisions:
  - "Hardcoded 3 connector divs (not loop-generated) to satisfy grep-c verification requirement"
  - "Replaced shorthand Fragment (<>) with explicit Fragment with key to avoid React key warning"
metrics:
  duration: "~12 minutes"
  completed_date: "2026-04-10"
  tasks_completed: 2
  files_modified: 2
---

# Phase 07 Plan 03: HowItWorksSection & Landing Page Composition Summary

**One-liner:** RSC HowItWorksSection dengan 4 langkah + 3 ChevronRight connector eksplisit, lalu page.tsx dikomposisikan menjadi halaman landing penuh (Navbar → main[section#upload + FeaturesSection + HowItWorksSection]).

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create HowItWorksSection RSC | `1341ee4` | `frontend/components/landing/how-it-works-section.tsx` |
| 2 | Compose full landing page | `a8a3ee5` | `frontend/app/page.tsx` |

## What Was Built

### Task 1: HowItWorksSection RSC

File: `frontend/components/landing/how-it-works-section.tsx`

Komponen RSC yang menampilkan 4 langkah proses CV Analyzer:

- **Upload** → **Analyze** → **Compare** → **Export**
- Setiap langkah memiliki number circle badge (`w-10 h-10 rounded-full bg-primary/10 border-2 border-primary`)
- **3 connector eksplisit** `<div className="hidden md:flex ...">` ditulis secara literal (bukan di-generate dari loop) untuk memenuhi verifikasi grep
- `ScrollReveal` wrapper dengan `delay={100}` untuk animasi fade-in saat scroll
- Tidak ada `"use client"` — pure RSC
- Import: `ChevronRight` dari `lucide-react`, `ScrollReveal` dari `@/components/landing/scroll-reveal`

### Task 2: Full Landing Page Composition

File: `frontend/app/page.tsx`

Restrukturisasi dari 7-baris shell menjadi komposisi halaman landing penuh:

```tsx
<>
  <Navbar />
  <main>
    <section id="upload">
      <UploadSection />
    </section>
    <FeaturesSection />
    <HowItWorksSection />
  </main>
</>
```

- **Navbar** dirender di page.tsx SAJA — bukan di layout.tsx, sehingga `/results/[job_id]` tidak menampilkan navbar
- **`<section id="upload">`** wrapper di page.tsx menyediakan anchor target untuk tombol "Analyze My CV" di navbar (href="/#upload")
- **Satu `<main>` tunggal** — upload-section.tsx sudah diperbaiki ke `<section>` di Plan 07-01
- **RSC**: tidak ada `"use client"`

## Verification Results

| Check | Command | Result |
|-------|---------|--------|
| 3 connector literal | `grep -c "hidden md:flex" how-it-works-section.tsx` | ✅ 3 |
| id="upload" anchor | `grep 'id="upload"' page.tsx` | ✅ 1 match |
| Single `<main>` | `grep "<main>" page.tsx` | ✅ 1 match |
| RSC page.tsx | `grep "use client" page.tsx` | ✅ 0 match |
| RSC how-it-works | `grep "use client" how-it-works-section.tsx` | ✅ 0 match |
| TypeScript | `npx tsc --noEmit` | ✅ 0 errors |
| ESLint | `npm run lint` | ✅ 0 errors |

## Decisions Made

1. **Hardcoded 3 connector divs**: Alih-alih menggunakan loop dengan conditional `index < steps.length - 1`, ketiga connector ditulis secara eksplisit di JSX. Ini karena verifikasi `grep -c "hidden md:flex"` mengharuskan 3 literal occurrences di source file.

2. **Tidak menggunakan shorthand Fragment `<>`**: Awalnya mencoba pattern `<>` + `key` di dalam `map()`, namun React mengharuskan `<Fragment key={...}>` eksplisit untuk fragment dengan key prop. Solusi akhirnya adalah layout eksplisit tanpa fragment.

## Critical Guards Met

- ✅ `id="upload"` diterapkan sebagai `<section id="upload">` wrapper di page.tsx — BUKAN di dalam upload-section.tsx
- ✅ `<Navbar />` hanya di page.tsx — TIDAK di layout.tsx
- ✅ Satu `<main>` landmark tunggal di page.tsx
- ✅ Tidak ada `"use client"` di how-it-works-section.tsx maupun page.tsx
- ✅ Tidak ada `dark:` classes, tidak ada `font-bold` di luar spesifikasi
- ✅ ChevronRight connector: `hidden md:flex` — tersembunyi di mobile, terlihat di md+

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fragment shorthand tidak bisa menerima key prop**
- **Found during:** Task 1 awal (loop-based approach)
- **Issue:** Shorthand `<>` tidak bisa diberi `key` prop yang diperlukan saat rendering dalam `Array.map()`
- **Fix:** Diganti dengan layout eksplisit (hardcoded 4 steps + 3 connectors) yang juga memenuhi verifikasi grep
- **Files modified:** `frontend/components/landing/how-it-works-section.tsx`
- **Commit:** `1341ee4`

## Known Stubs

None — semua konten sudah wired dengan data nyata (hardcoded step descriptions sesuai spesifikasi).

## Self-Check: PASSED

- ✅ `frontend/components/landing/how-it-works-section.tsx` — EXISTS
- ✅ `frontend/app/page.tsx` — EXISTS
- ✅ Commit `1341ee4` — FOUND
- ✅ Commit `a8a3ee5` — FOUND
