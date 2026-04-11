---
phase: 09-visual-design-system
plan: 02
subsystem: frontend/landing-pages
tags: [mathical, redesign, hero, navbar, landing-sections, coming-soon, dark-card, word-pill]
dependency_graph:
  requires:
    - 09-01-PLAN.md (CSS tokens, Bricolage Grotesque font, AccentPill component)
  provides:
    - Mathical-styled navbar (cream bg, display font logo, two-part CTA)
    - Hero section full rebuild (dark card, word-pill h1, decorative circles)
    - Products section dark card treatment
    - Features section cream/white card treatment
    - HowItWorks section with AccentPill step numbers
    - Stats section dark bg with display font numbers
    - CV Builder coming-soon dark card page
    - Job Finding coming-soon dark card page
  affects:
    - Homepage visual identity (full Mathical transformation)
    - /cv-builder and /job-finding pages
tech_stack:
  added: []
  patterns:
    - Word-pill headline with AccentPill components inline in h1
    - Two-part CTA pattern (pill text button + circular arrow button)
    - Dark card on cream background layout
    - Decorative aria-hidden circles pattern
    - Server Components for static coming-soon pages
key_files:
  created: []
  modified:
    - frontend/components/landing/navbar.tsx
    - frontend/components/landing/hero-section.tsx
    - frontend/components/landing/products-section.tsx
    - frontend/components/landing/features-section.tsx
    - frontend/components/landing/how-it-works-section.tsx
    - frontend/components/landing/stats-section.tsx
    - frontend/app/cv-builder/page.tsx
    - frontend/app/job-finding/page.tsx
decisions:
  - "Used existing useUploadModal path (@/components/providers/upload-modal-provider) — plan listed @/hooks/use-upload-modal which doesn't exist"
  - "ProductCardCTA client island kept as-is for active card CTA — no changes needed"
  - "Removed shadcn Card, Badge, Button components from landing sections — replaced with semantic HTML + Mathical tokens"
  - "Coming-soon pages kept as Server Components (email input cosmetic only per plan)"
  - "HowItWorks used data array pattern for DRY step rendering instead of repeated JSX blocks"
metrics:
  duration: "~20 minutes"
  completed: "2026-04-11"
  tasks_completed: 3
  tasks_total: 3
  files_modified: 8
  files_created: 0
---

# Phase 9 Plan 02: Landing Page & Coming-Soon Redesign Summary

**One-liner:** Full Mathical aesthetic transformation — dark card hero with word-pill AccentPill h1, cream/dark alternating landing sections, two-part CTA pattern, and dark card coming-soon pages.

---

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Restyle navbar.tsx + full rebuild hero-section.tsx | `d574d5c` | navbar.tsx, hero-section.tsx |
| 2 | Restyle Products, Features, HIWS, Stats sections | `c6d71b3` | products-section.tsx, features-section.tsx, how-it-works-section.tsx, stats-section.tsx |
| 3 | Restyle coming-soon pages (cv-builder + job-finding) | `383302d` | cv-builder/page.tsx, job-finding/page.tsx |

---

## What Was Built

### Task 1: Navbar + Hero Section

**`frontend/components/landing/navbar.tsx`** — Restyled navbar:
- Header: cream `#F5F2D8/95` bg with `backdrop-blur-sm` and `border-[#141414]/10`
- Logo: Bricolage Grotesque (`font-display font-extrabold`) with lime `text-[#CAFF43]` "k"
- Nav links: `font-normal text-[#141414]/60` with hover to full dark
- Desktop CTA: two-part pattern — dark pill "Get Started" + lime circle arrow button
- Mobile Sheet: cream bg, two-part full-width CTA
- Removed: shadcn Button component (replaced with native `<button>` + Mathical classes)

**`frontend/components/landing/hero-section.tsx`** — Full rebuild:
- Dark `bg-[#141414] rounded-[2rem]` card on cream `#F5F2D8` background
- Word-pill h1 with 3 AccentPills: `lime "deserves"`, `pink "better"`, `orange "now"`
- Pink `✿` flower icon (aria-hidden) between first word and first pill
- 5 decorative circles scattered in card corners (all aria-hidden)
- Sub-headline `text-[#F5F2D8]/70` + descriptor `text-[#F5F2D8]/50`
- Two-part CTA: cream pill "Analyze My CV" + lime `w-14 h-14` circle arrow
- Both CTA buttons call `openModal()` via `useUploadModal` hook

### Task 2: Landing Sections

**`products-section.tsx`** — Dark treatment:
- Section: `bg-[#141414]`, heading in `text-[#F5F2D8]`
- Cards: `bg-[#1C1C1C] rounded-2xl border border-[#F5F2D8]/5`
- Per-product icon containers: orange/lime/purple with `/15` opacity
- Active badge: `<AccentPill color="lime" size="md">Active</AccentPill>`
- Coming Soon badge: `bg-[#F5F2D8]/10 text-[#F5F2D8]/50`
- Removed `bg-muted/30`, shadcn Card, shadcn Badge

**`features-section.tsx`** — Cream treatment:
- Section: `bg-[#F5F2D8]`, heading/text in `text-[#141414]`
- Cards: `bg-white rounded-2xl border-0 shadow-sm` with hover lift + shadow
- Per-feature icon containers: lime/pink/orange with `/20` opacity
- Removed shadcn Card component

**`how-it-works-section.tsx`** — AccentPill steps:
- Section: `bg-[#F5F2D8] border-t border-[#141414]/10`
- Step numbers: `<AccentPill color={lime|pink|orange|purple} size="md">1|2|3|4</AccentPill>`
- Desktop ChevronRight connectors: `text-[#141414]/30`
- Refactored to data-driven array for DRY rendering
- Removed gradient/circle border step indicators

**`stats-section.tsx`** — Dark stats display:
- Section: `bg-[#141414]`, removed `border-y border-border`
- Numbers: `font-display font-extrabold text-2xl md:text-3xl`
- "4" → `text-[#CAFF43]` (lime), others → `text-[#F5F2D8]`
- Dividers: `bg-[#F5F2D8]/10` (was `bg-border`)
- Added `isLime` field to stats data array

### Task 3: Coming-Soon Pages

**`cv-builder/page.tsx`** and **`job-finding/page.tsx`** — Both rebuilt with:
- Page bg: `bg-[#F5F2D8]` with vertical centering
- Dark card: `bg-[#141414] rounded-[2rem] px-10 py-12 max-w-sm`
- CV Builder: orange `FileText` icon
- Job Finding: purple `Search` icon  
- "Coming Soon" badge: `bg-[#F5F2D8]/10 text-[#F5F2D8]/50 rounded-full`
- Email input: `bg-[#F5F2D8]/10 border border-[#F5F2D8]/10` with lime focus ring
- "Notify Me" two-part: lime pill + `bg-[#F5F2D8]/10` circle arrow
- "← Back to pathkr" link in cream/dark muted style
- Server Components (no "use client" — email is cosmetic only)

---

## Verification Results

| Check | Result |
|-------|--------|
| `npm run lint` (Task 1) | ✅ No ESLint warnings or errors |
| `npm run lint && npx tsc --noEmit` (Task 2) | ✅ Zero TypeScript errors |
| `npm run lint && npx tsc --noEmit` (Task 3) | ✅ Zero TypeScript errors |
| `npm run build` (final) | ✅ Compiled successfully — all 6 routes |

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] useUploadModal import path mismatch**
- **Found during:** Task 1 implementation
- **Issue:** Plan's hero-section.tsx action listed `import { useUploadModal } from "@/hooks/use-upload-modal"` but this path doesn't exist. The actual provider is at `@/components/providers/upload-modal-provider`.
- **Fix:** Used the existing correct import path from the current navbar.tsx and hero-section.tsx: `@/components/providers/upload-modal-provider`
- **Files modified:** hero-section.tsx, navbar.tsx (kept correct path)
- **Commit:** `d574d5c`

---

## Known Stubs

None — all components render real content from the design system. Email inputs on coming-soon pages are intentionally cosmetic (no backend wiring in Phase 9 per threat model T-09-03).

---

## Threat Flags

None — no new network endpoints, auth paths, or trust boundaries introduced. All changes are purely visual/layout.

---

## Self-Check: PASSED

- ✅ `frontend/components/landing/navbar.tsx` — contains `bg-[#F5F2D8]/95` and `font-display font-extrabold` logo
- ✅ `frontend/components/landing/hero-section.tsx` — contains `bg-[#141414] rounded-[2rem]` and `<AccentPill color="lime"`
- ✅ `frontend/components/landing/products-section.tsx` — contains `bg-[#141414]` section and `bg-[#1C1C1C]` cards
- ✅ `frontend/components/landing/features-section.tsx` — contains `bg-[#F5F2D8]` section and `bg-white` cards
- ✅ `frontend/components/landing/how-it-works-section.tsx` — contains `<AccentPill color="lime"` step numbers
- ✅ `frontend/components/landing/stats-section.tsx` — contains `bg-[#141414]` and `text-[#CAFF43]` for "4"
- ✅ `frontend/app/cv-builder/page.tsx` — contains `bg-[#141414] rounded-[2rem]` dark card and `FileText` orange icon
- ✅ `frontend/app/job-finding/page.tsx` — contains `bg-[#141414] rounded-[2rem]` dark card and `Search` purple icon
- ✅ Commit `d574d5c` — Task 1: navbar + hero
- ✅ Commit `c6d71b3` — Task 2: 4 landing sections
- ✅ Commit `383302d` — Task 3: coming-soon pages
- ✅ `npm run build` — all 6 routes compiled successfully
