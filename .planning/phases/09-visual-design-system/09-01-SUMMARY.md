---
phase: 09-visual-design-system
plan: 01
subsystem: frontend/design-system
tags: [css-tokens, tailwind, fonts, components, mathical]
dependency_graph:
  requires: []
  provides:
    - Mathical CSS color token set (globals.css)
    - display font family (tailwind.config.ts fontFamily.display)
    - Bricolage Grotesque font variable (layout.tsx)
    - AccentPill reusable component (components/ui/accent-pill.tsx)
  affects:
    - All pages (cream background via --background token)
    - All shadcn components (new --radius 0.75rem)
    - bg-secondary (now dark #141414 — downstream components must be aware)
tech_stack:
  added:
    - Bricolage_Grotesque via next/font/google (weights 700+800)
  patterns:
    - CSS custom properties via HSL triplets (shadcn pattern)
    - Direct hex tokens (--color-lime, --color-pink, etc.) for arbitrary Tailwind values
    - Dual font variable injection on <html> tag
    - AccentPill with colorMap + sizeMap lookup tables
key_files:
  created:
    - frontend/components/ui/accent-pill.tsx
  modified:
    - frontend/app/globals.css
    - frontend/tailwind.config.ts
    - frontend/app/layout.tsx
decisions:
  - "Used HSL triplet format for shadcn-compatible CSS variables (e.g. 54 59% 90% not hsl(...))"
  - "Bricolage_Grotesque loaded with weights ['700','800'] only — no heavier subset download"
  - "borderRadius['2rem'] added for hero dark card rounded-[2rem] pattern"
  - "bg-secondary now resolves to #141414 (dark) — documented as known downstream impact"
metrics:
  duration: "~15 minutes"
  completed: "2026-04-11"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 3
  files_created: 1
---

# Phase 9 Plan 01: Mathical Design System Foundation Summary

**One-liner:** CSS token migration to cream/dark Mathical palette + Bricolage Grotesque display font + AccentPill component with 6 color variants.

---

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Migrate globals.css + tailwind.config.ts to Mathical design tokens | `f6b5052` | globals.css, tailwind.config.ts |
| 2 | Add Bricolage Grotesque to layout.tsx + create AccentPill component | `eac632f` | layout.tsx, accent-pill.tsx (NEW) |

---

## What Was Built

### Task 1: CSS Design Tokens
- **`frontend/app/globals.css`** — Replaced entire `:root {}` block with Mathical palette:
  - `--background: 54 59% 90%` → cream `#F5F2D8` (page background now cream across all pages)
  - `--secondary: 0 0% 8%` → dark `#141414` (previously light gray)
  - `--primary: 77 100% 63%` → lime `#CAFF43` accent
  - `--radius: 0.75rem` → rounder than previous 0.5rem
  - Added 7 direct hex tokens: `--color-cream`, `--color-dark`, `--color-dark-card`, `--color-lime`, `--color-pink`, `--color-orange`, `--color-purple`
  - Kept all `prefers-reduced-motion` blocks untouched

- **`frontend/tailwind.config.ts`** — Two surgical additions:
  - `fontFamily.display: ["var(--font-display)", "system-ui", "sans-serif"]`
  - `borderRadius["2rem"]: "2rem"` for hero card treatment

### Task 2: Font + AccentPill Component
- **`frontend/app/layout.tsx`** — Added Bricolage Grotesque alongside Inter:
  - Import: `import { Inter, Bricolage_Grotesque } from "next/font/google"`
  - Config: `subsets: ["latin"], display: "swap", variable: "--font-display", weight: ["700", "800"]`
  - HTML tag: `className={\`${inter.variable} ${bricolageGrotesque.variable}\`}`

- **`frontend/components/ui/accent-pill.tsx`** (NEW) — Reusable AccentPill component:
  - 6 color variants: `lime`, `pink`, `orange`, `purple`, `white`, `dark`
  - 2 size variants: `sm` (px-4 py-1 text-sm), `md` (px-6 py-2 text-base)
  - Uses `font-display` + `font-extrabold` on all variants
  - Full TypeScript types with `cn()` for className merging

---

## Verification Results

| Check | Result |
|-------|--------|
| `npm run lint` | ✅ No ESLint warnings or errors |
| `npx tsc --noEmit` | ✅ Zero TypeScript errors |
| `npm run build` | ✅ Compiled successfully — all 6 routes static/dynamic |

---

## Deviations from Plan

None — plan executed exactly as written.

---

## Known Downstream Impact

> ⚠️ **`bg-secondary` is now dark `#141414`** — Components using `bg-secondary` (e.g. `ResultsTabs` background) will now render dark instead of light gray. This is intentional per the Mathical design system, but downstream Phase 9 plans (landing sections, results page) must explicitly handle this when restyling those components.

---

## Self-Check: PASSED

- ✅ `frontend/app/globals.css` — contains `--background: 54 59% 90%` and `--secondary: 0 0% 8%`
- ✅ `frontend/tailwind.config.ts` — contains `fontFamily.display` and `borderRadius["2rem"]`
- ✅ `frontend/app/layout.tsx` — contains `bricolageGrotesque.variable`
- ✅ `frontend/components/ui/accent-pill.tsx` — exists, exports `AccentPill`
- ✅ Commit `f6b5052` — Task 1
- ✅ Commit `eac632f` — Task 2
