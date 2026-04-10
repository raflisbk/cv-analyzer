---
phase: 08-upload-modal-navbar
plan: "04"
subsystem: frontend/landing
tags: [homepage, hero, products, stats, RSC, client-component]
dependency_graph:
  requires: [08-01]
  provides: [hero-section, products-section, product-card-cta, stats-section]
  affects: []
tech_stack:
  added: []
  patterns: [RSC-with-client-island, radial-gradient-bg, product-card-grid]
key_files:
  created:
    - frontend/components/landing/hero-section.tsx
    - frontend/components/landing/product-card-cta.tsx
    - frontend/components/landing/products-section.tsx
    - frontend/components/landing/stats-section.tsx
  modified: []
decisions:
  - ProductsSection kept as RSC; only ProductCardCTA is "use client" for minimal client JS bundle
  - StatsSection is pure RSC (no interactivity needed)
  - HeroSection is full client component (simplest approach for openModal hook)
metrics:
  duration: ~5min
  completed: "2025-01-27"
  tasks_completed: 2
  files_created: 4
---

# Phase 08 Plan 04: Homepage Sections (Hero, Products, Stats) Summary

**One-liner:** Four homepage marketing sections — HeroSection (client, openModal CTA), ProductsSection (RSC + ProductCardCTA island), and StatsSection (RSC) — with clean minimal styling, no dark: classes.

## Files Created

| File | Type | Exports |
|------|------|---------|
| `frontend/components/landing/hero-section.tsx` | `"use client"` | `default HeroSection` |
| `frontend/components/landing/product-card-cta.tsx` | `"use client"` | `default ProductCardCTA` |
| `frontend/components/landing/products-section.tsx` | RSC | `default ProductsSection` |
| `frontend/components/landing/stats-section.tsx` | RSC | `default StatsSection` |

## Verification Results

| Check | Result |
|-------|--------|
| `"use client"` in HeroSection | ✅ PASS |
| `openModal()` wired in HeroSection CTA | ✅ PASS |
| 3 product IDs in ProductsSection | ✅ PASS (5 matches — id + href refs) |
| ProductCardCTA uses `useUploadModal` + `openModal` | ✅ PASS |
| 4 stats in StatsSection | ✅ PASS |
| No `dark:` classes in any new file | ✅ PASS |
| TypeScript `--noEmit` clean | ✅ PASS (exit code 0) |

## Component Details

### HeroSection (`"use client"`)
- Headline: "Your Career, On the **Right Path**" — "Right Path" in `text-primary`
- Sub-headline: "AI-powered CV analysis, skill gap detection, and job matching — all in one place."
- CTA: "Start Analyzing" Button (`size="lg"`, `rounded-full`) calls `openModal()`
- Background: radial gradient (`hsl(var(--primary)/0.08)` ellipse from top-center)

### ProductsSection (RSC)
- 3 cards: CV Builder (Coming Soon), CV Analyzer (Active), Job Finding (Coming Soon)
- CV Analyzer card embeds `<ProductCardCTA />` client island
- CV Builder + Job Finding link to `/cv-builder` and `/job-finding`
- Active badge: `text-primary border-primary/30 bg-primary/10`
- Coming Soon badge: `variant="secondary"`

### ProductCardCTA (`"use client"`)
- Tiny client island: `<button onClick={openModal}>Analyze My CV →</button>`
- Enables `openModal()` inside RSC ProductsSection without making the whole section a client component

### StatsSection (RSC)
- 4 stats: "10,000+ CVs Analyzed", "4 Scoring Dimensions", "Free To Use", "Instant Results"
- Desktop dividers (`w-px h-8 bg-border`) between items, hidden on mobile
- Background: `bg-background border-y border-border`

## Deviations from Plan

None — plan executed exactly as written. All 4 files match the spec in 08-04-PLAN.md.

## Known Stubs

None — all sections are complete with real content, no placeholder data.

## Self-Check

- ✅ `frontend/components/landing/hero-section.tsx` exists
- ✅ `frontend/components/landing/product-card-cta.tsx` exists
- ✅ `frontend/components/landing/products-section.tsx` exists
- ✅ `frontend/components/landing/stats-section.tsx` exists
- ✅ Commit `6fe290d` exists

## Self-Check: PASSED
