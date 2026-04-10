# Project Research Summary

**Project:** CV Analyzer — v2.0 Seamless Homepage
**Domain:** Next.js 15 Landing Page Redesign (App Router + shadcn/ui)
**Researched:** 2025-04-10
**Synthesized:** 2025-04-10
**Confidence:** HIGH (based on direct codebase inspection + stable landing page patterns)

## Executive Summary

The v2.0 Seamless Homepage milestone converts the current bare-upload-zone homepage into a full marketing landing page — keeping the existing upload flow intact while adding a Navbar, Hero, Features, and "How It Works" sections. The recommended approach uses **Option B: RSC shell + client islands**: `app/page.tsx` becomes a Server Component that renders static sections, while upload logic migrates verbatim to a new `UploadModal` client component wrapped in a shadcn Dialog. Static landing copy is server-rendered HTML, not JavaScript — critical for LCP performance and SEO signalling.

The single most consequential design decision is the animation strategy. **STACK.md recommends `motion@^12.38.0` (Framer Motion v12); this recommendation is overridden.** `tailwindcss-animate` is already installed, actively used in the codebase, SSR-safe, and handles 100% of the required scroll entrance effects via `IntersectionObserver` class-toggling. Adding `motion` introduces 27KB gzip bundle overhead, React 19 hydration mismatch risks (confirmed by PITFALLS.md LP-4), and a pattern inconsistent with the existing codebase — all for zero additional capability in this use case. The correct choice is `tailwindcss-animate` + a custom `ScrollReveal` client component backed by native `IntersectionObserver`.

The only new dependency needed is `@radix-ui/react-dialog` (installed via `npx shadcn@latest add dialog`). STACK.md recommends also adding `vaul` (Drawer) and Sheet; FEATURES.md explicitly lists these as anti-features — skip them. The shadcn Dialog works across all viewports and requires no additional Radix primitives. Total delta is **1 new dependency** and **7 new component files**, with 0 modifications to any existing upload components.

---

## ⚠️ Resolved Conflict: Animation Library

| File | Recommendation |
|------|---------------|
| STACK.md | `motion@^12.38.0` (Framer Motion v12) |
| FEATURES.md | `tailwindcss-animate` + IntersectionObserver — explicit anti-feature for Framer Motion |
| ARCHITECTURE.md | `tailwindcss-animate` + IntersectionObserver — full implementation provided |
| PITFALLS.md | Framer Motion HIGH risk: hydration mismatch in React 19 (LP-4), 27KB bundle (LP-8) |

**Resolution: `tailwindcss-animate` + `IntersectionObserver` is the correct choice.**

Rationale:
1. **Zero new dependencies** — `tailwindcss-animate@1.0.7` is already in `package.json` and actively used (`animate-in fade-in slide-in-from-bottom-2` confirmed in `page.tsx` line 110)
2. **SSR-safe by default** — server renders `opacity-0`, client adds animation classes after hydration; server/client initial state agree
3. **27KB bundle avoided** — Framer Motion adds ~27KB gzip for fade-in effects achievable in 20 lines of native code
4. **React 19 compliance** — React 19's stricter hydration reconciliation breaks `whileInView` prop without `LazyMotion` + `ssr: false` gymnastics (confirmed PITFALLS LP-4)
5. **Codebase consistency** — existing code uses `tailwindcss-animate` patterns; switching animation paradigms mid-project creates two-system complexity
6. **`prefers-reduced-motion` already handled** — `globals.css` has the CSS override; CSS animations respect it automatically without `useReducedMotion()` hook

## Key Findings

### Recommended Stack (v2.0 Landing Page)

The project is already built on Next.js 15 + React 19 + Tailwind CSS v3.4.19 + shadcn/ui (New York style). **Do not introduce new patterns**; extend what exists.

**Confirmed installed (zero action needed):**
- `tailwindcss-animate@1.0.7` — scroll entrance animations via `IntersectionObserver` + CSS classes
- `lucide-react@1.7.0` — all icons needed (`Brain`, `Zap`, `FileText`, `ArrowRight`, `CheckCircle2`, `Sparkles`)
- `@tanstack/react-query`, `react-dropzone` — already powering upload hooks

**One new dependency (required):**
- `@radix-ui/react-dialog` via `npx shadcn@latest add dialog` — modal primitive for UploadModal

**Explicitly rejected packages:**
- `motion` / `framer-motion` — see resolved conflict above
- `vaul` (shadcn Drawer) — FEATURES.md anti-feature; Dialog is sufficient for all viewports
- `react-intersection-observer` npm package — redundant with 20-line native implementation
- `aos` / `animate.css` — incompatible with Next.js hydration patterns

> ⚠️ **Tailwind version:** actual installed version is **v3.4.19** (NOT v4 as stated in milestone brief). Do NOT upgrade during this milestone — it is a breaking change.

**See:** `.planning/research/STACK.md` for full package version audit

---

### Expected Features (Landing Page)

**Must have — table stakes (every SaaS landing page has these):**
- Sticky Navbar with logo, GitHub link, primary CTA button
- Hero section: outcome-first headline, sub-headline, "Analyze My CV" CTA, trust strip
- Features section: 3–4 cards (icon + outcome title + 1 sentence)
- "How It Works" section: 3 numbered steps with connector line on desktop
- Upload Dialog: CTA opens shadcn Dialog wrapping existing `<UploadZone />`
- Scroll entrance animations: fade-in / slide-up sections on viewport entry
- Responsive layout: single-column mobile, grid desktop
- Smooth scroll behavior (`html { scroll-behavior: smooth }`)

**Should have — differentiators (signal AI engineering taste):**
- Tech credibility badge in hero: `"Powered by GPT-4o-mini · RAG · pgvector"` — direct recruiter signal, 10 min
- Gradient text on hero headline keyword: `bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent` — Stripe aesthetic, 5 min
- Animated score counter on scroll: `useEffect` + `requestAnimationFrame`, ~15 lines, no library — the "wow" moment
- Subtle dot-grid hero background: `radial-gradient` CSS, 3 lines — hero identity
- Feature card hover lift: `hover:-translate-y-1 hover:shadow-md transition-all duration-200` — polish signal
- Step connector line in "How It Works": CSS `border-top` trick on desktop

**Defer to later milestone:**
- Dark mode toggle — `globals.css` has no `.dark {}` block; adding `dark:` classes now creates two-system inconsistency
- Real demo screenshots/GIFs in hero — requires captured analysis output
- Before/after rewrite teaser card — medium effort (2h); include only if time allows
- Scroll-linked navbar opacity — nice polish but not blocking

**Explicitly skip (anti-features):**
- Testimonials — fake testimonials look fake to technical recruiters
- Pricing section — free tool, pricing creates confusion
- Video/GIF autoplay hero background — heavy, antithetical to Stripe aesthetic
- Parallax scrolling — mobile jank, accessibility issues, over-engineered
- Social proof counters ("10,000+ CVs") — no real data; tech badge is more credible
- Cookie consent banner — no tracking, no GDPR obligation

**Recommended hero copy:**
```
Headline: "Your CV, analyzed by AI in seconds."
Sub-headline: "Get multi-dimensional feedback on clarity, impact, ATS compatibility,
               and keyword strength. No account required."
CTA: "Analyze My CV"
Trust strip: "No signup · PDF & DOCX · Free · ~30s"
```

**See:** `.planning/research/FEATURES.md` for full copy patterns, complexity estimates, and effort vs. impact matrix

---

### Architecture Approach

Replace the current monolithic `"use client"` `app/page.tsx` (183 lines, manages upload state machine) with a **Server Component shell** that renders thin client islands at component boundaries. The upload state machine migrates verbatim to `UploadModal` — no business logic is rewritten, only relocated.

**New file structure (7 new files, 1 file modified, 0 existing upload files changed):**

```
components/landing/
├── navbar.tsx                  NEW — Server Component (logo, nav, CTA button)
├── hero-with-modal.tsx         NEW — Client Component (isOpen state + hero + CTA + modal)
├── upload-modal.tsx            NEW — Client Component (state machine migrated from page.tsx)
├── features-section.tsx        NEW — Server Component (static card grid)
├── how-it-works-section.tsx    NEW — Server Component (static step list)
└── scroll-reveal.tsx           NEW — Client Component (IntersectionObserver wrapper)

components/ui/
└── dialog.tsx                  NEW — via `npx shadcn@latest add dialog`

app/page.tsx                    MODIFIED — becomes Server Component RSC shell
```

**Component type decisions:**
| Component | Type | Reason |
|-----------|------|--------|
| `page.tsx` | Server Component | Remove `"use client"` — static layout shell |
| `navbar.tsx` | Server Component | Static markup; no browser events |
| `hero-with-modal.tsx` | Client Component | Owns `isOpen` state + button `onClick` |
| `upload-modal.tsx` | Client Component | `useState`, `useUpload`, `useJobStream`, `router.push` |
| `features-section.tsx` | Server Component | Static card markup; no interactivity |
| `how-it-works-section.tsx` | Server Component | Static step markup; no interactivity |
| `scroll-reveal.tsx` | Client Component | `IntersectionObserver` is browser-only API |

**`HeroWithModal` pattern (recommended over separate RSC hero + client CTA):**
One `"use client"` component owns `isOpen`, renders both hero copy JSX and `<UploadModal>`. For a landing page this size, the RSC split for hero text (which would require a tiny CTA button client island) offers negligible benefit over the cleaner single-island composition.

**Key SSR safety guarantee for `ScrollReveal`:**
```tsx
// Server renders: className="opacity-0" (isVisible starts false)
// After hydration: IntersectionObserver fires, setIsVisible(true) → animation class added
// Server/client initial state agree → NO hydration mismatch
const [isVisible, setIsVisible] = useState(false); // ← starts false, same on server + client
```

**See:** `.planning/research/ARCHITECTURE.md` for full data flow diagram, build order, and integration point code snippets

---

### Critical Pitfalls

**Landing-page-specific (v2.0 milestone):**

1. **`"use client"` boundary pollution kills RSC benefits (LP-1, CRITICAL)** — Adding landing sections to the existing `"use client"` `page.tsx` silently ships all static copy as JavaScript. Remove `"use client"` from `page.tsx`; push it down to leaf components only. Warning sign: `next build` shows `app/page.tsx` as a large (>50KB) client bundle.

2. **Upload SSE stream destroyed on modal close (LP-2, CRITICAL)** — Closing the Dialog unmounts `UploadModal`, triggering `useJobStream`'s `EventSource` cleanup (`connection.close()` at `use-job-stream.ts:69`) mid-stream. **Prevention: block modal close during active processing.** `onOpenChange={(open) => { if (!open && (isProcessing || isConnected)) return; setIsOpen(open); }}`. Show "Processing — please keep this window open."

3. **Framer Motion hydration mismatch in React 19 (LP-4, HIGH)** — `whileInView` prop triggers `IntersectionObserver` on client; server renders element as visible; client renders it as hidden → React 19 throws hydration error (stricter than React 18). **Resolved: don't use Framer Motion.** Use `tailwindcss-animate` + `ScrollReveal` component.

4. **Dark mode CSS variable gap (LP-3, CRITICAL for consistency)** — `globals.css` has no `.dark {}` block. Using `dark:` utility classes on new landing sections creates a half-broken theming system. **Prevention: use ONLY semantic token classes** (`bg-background`, `text-foreground`, `text-muted-foreground`) — never raw Tailwind color classes (`bg-slate-50`, `text-gray-900`) in new sections.

5. **LCP regression from hero animation (LP-6, HIGH)** — If the hero headline (the LCP element) is inside a component with `initial={{ opacity: 0 }}` or equivalent, it's invisible on server render — LCP fires late. **Prevention: hero headline must be server-rendered visible text.** Apply entrance animations only to non-LCP elements (CTA button, trust strip, background).

6. **Inter font not wired to Tailwind `font-sans` (LP-10, LOW)** — `layout.tsx` sets `--font-inter` CSS variable but `tailwind.config.ts` has no `fontFamily` extension. New sections using `font-sans` get system fonts, not Inter. **Fix:** add `fontFamily: { sans: ["var(--font-inter)", "ui-sans-serif", ...] }` to `tailwind.config.ts` when setting up typography.

**See:** `.planning/research/PITFALLS.md` for full phase-specific warning matrix (LP-1 through LP-11)

---

## Implications for Roadmap

Suggested phase structure based on dependency graph (each step unblocks the next):

### Phase 1: Infrastructure + Primitives

**Rationale:** Both `ScrollReveal` and `UploadModal` depend on foundational primitives being in place. Dialog must exist before modal; scroll utility must exist before section wiring. These are zero-risk steps with no functional regressions.

**Delivers:** `components/ui/dialog.tsx` (shadcn), `components/landing/scroll-reveal.tsx` (IntersectionObserver wrapper)

**Addresses:** LANDING-04 (modal container), LANDING-05 (scroll animations)

**Avoids:** LP-4 (no Framer Motion), LP-5 (IntersectionObserver inside `useEffect` only)

**Install:** `npx shadcn@latest add dialog` — adds `@radix-ui/react-dialog`, generates `dialog.tsx`

---

### Phase 2: Static Section Components

**Rationale:** Navbar, FeaturesSection, and HowItWorksSection have zero dependencies (pure static markup + Tailwind). Build them in parallel before the complex client components. They can be developed and visually tested in isolation.

**Delivers:** `navbar.tsx` (Server Component), `features-section.tsx` (Server Component), `how-it-works-section.tsx` (Server Component)

**Addresses:** LANDING-01 (Navbar), LANDING-02 (Features), LANDING-03 (How It Works)

**Avoids:** LP-1 (these are intentionally NOT "use client"), LP-3 (use only semantic tokens — `bg-background`, `text-foreground`)

**Fix included:** Wire Inter font to `font-sans` in `tailwind.config.ts` (LP-10) when setting up Navbar typography.

**Differentiators to include here:** gradient text, dot-grid background, hover lift classes, step connector line, tech badge, trust strip — all pure Tailwind, ~30 mins total.

---

### Phase 3: Upload Modal Migration

**Rationale:** The upload state machine is the highest-risk component in this milestone. Migrate it in isolation before wiring to the hero, so it can be tested independently. The state machine code moves verbatim from `page.tsx` — no business logic changes.

**Delivers:** `components/landing/upload-modal.tsx` — full upload state machine (idle → file-selected → uploading → processing → complete/failed), wrapped in shadcn Dialog

**Addresses:** LANDING-04 (upload CTA)

**Avoids:** LP-2 (block Dialog close during `isProcessing || isConnected`), LP-2 alt (preserve `router.push` to results on completion)

**Critical:** All 4 states preserved (`selectedFile`, `jobId`, `completedJobId`, `isNavigating`). Hooks `useUpload` and `useJobStream` move here unchanged. `UploadZone`, `DocumentPreview`, `ProcessingStages` components used with zero modifications.

---

### Phase 4: Hero Integration

**Rationale:** `HeroWithModal` is the composition layer — it depends on `UploadModal` (Phase 3) being complete. Once the modal is tested, the hero wrapper is straightforward: owns `isOpen` state, renders hero copy + CTA button + `<UploadModal>`.

**Delivers:** `components/landing/hero-with-modal.tsx` — single client island owning `isOpen` state, headline, sub-headline, CTA button, trust strip, tech badge, dot-grid background

**Addresses:** LANDING-01 (Hero), LANDING-04 (CTA trigger)

**Avoids:** LP-6 (hero headline is static JSX, not wrapped in opacity-0 animation)

**Pattern:** `HeroWithModal` is `"use client"` but hero text lives as JSX inside it (not a separate RSC) — cleaner composition for this page size.

---

### Phase 5: Page Integration + Style Consistency

**Rationale:** All components exist; now wire them together in the new `page.tsx` RSC shell. This is the step that removes `"use client"` from the page root — the highest-leverage change in the milestone.

**Delivers:** Fully replaced `app/page.tsx` — Server Component shell rendering `<Navbar />`, `<HeroWithModal />`, `<ScrollReveal><FeaturesSection /></ScrollReveal>`, `<ScrollReveal><HowItWorksSection /></ScrollReveal>`

**Addresses:** All LANDING tasks end-to-end

**Avoids:** LP-1 (verify page.tsx has NO `"use client"` directive), LP-3 (audit all new sections for raw Tailwind color classes vs semantic tokens)

**Verify:** Run `next build` — `app/page.tsx` should NOT appear in the client bundle. End-to-end upload flow must work identically to pre-migration.

---

### Phase 6: Polish + Animations

**Rationale:** With the structure in place, animation timing and differentiator polish are low-risk refinements that can be iterated quickly.

**Delivers:** Tuned `ScrollReveal` delays/thresholds, animated score counter in Features card, scroll-linked navbar opacity (if time allows), `prefers-reduced-motion` verification

**Addresses:** LANDING-05 (scroll animations), LANDING-06 (visual consistency), LANDING-07 (navbar)

**Avoids:** LP-7 (CLS — only `opacity` and `transform` animated, never `height`/`margin`), LP-9 (CSS approach handles reduced-motion automatically via `globals.css`)

---

### Phase Ordering Rationale

- **Primitives before composition:** Dialog and ScrollReveal must exist before UploadModal and page wiring
- **Static before dynamic:** Server Component sections (Navbar, Features, HowItWorks) have zero risk; build first to establish visual skeleton
- **Modal isolation before hero:** Upload state machine is highest risk; test in isolation before composing with hero
- **Hero before page:** HeroWithModal requires UploadModal; page requires HeroWithModal
- **Style consistency last but first in code:** LP-3 (semantic tokens) is enforced during section writing, not as a retroactive audit

### Research Flags

**Phases with standard patterns (no additional research needed):**
- **Phase 1:** `npx shadcn@latest add dialog` is documented, tested; no unknowns
- **Phase 2:** Static Server Components + Tailwind — no API research needed; patterns fully established
- **Phase 3:** Upload state migration is a relocation, not a rewrite — same hooks, same components
- **Phase 4:** `useState` + conditional render — trivial React pattern

**Phases to watch (light validation during implementation):**
- **Phase 5:** After `page.tsx` replace, run full upload flow E2E test — confirm SSE stream still connects and `router.push` to results works. ARCHITECTURE.md's build order (step 9) explicitly flags this as the verify step.
- **Phase 6:** Verify scroll animation threshold values (`rootMargin: "0px 0px -50px 0px"`, `threshold: 0.1`) feel correct on both desktop and mobile. May need tuning.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Direct `package.json` + `node_modules` inspection; `tailwindcss-animate` confirmed in use, `framer-motion` confirmed absent |
| Features | HIGH | Landing page patterns are stable + well-documented; all recommendations verified against existing project code and PROJECT.md requirements (LANDING-01 through LANDING-07) |
| Architecture | HIGH | Based on direct codebase inspection of `page.tsx`, `upload-zone.tsx`, `globals.css`, `layout.tsx`; all component boundaries verified against actual file contents |
| Pitfalls | HIGH | All pitfalls are codebase-specific (exact file + line references); LP-4 Framer Motion risk confirmed against React 19 behavior documentation |

**Overall confidence: HIGH**

All research grounded in direct codebase inspection, not abstract patterns. Key decisions are validated against actual installed packages and existing code patterns.

### Gaps to Address

- **`@radix-ui/react-dialog` version:** STACK.md cites `^1.1.15` as of 2025-04-10. Pin exact version at install time and note it in `package.json` for reproducibility.

- **Dialog sizing for upload flow:** `sm:max-w-[640px]` recommended (ARCHITECTURE.md) to fit `UploadZone`'s 600px width + 240px min-height constraints. Validate visually on mobile (375px viewport) — `max-w-[640px]` on small screens may need `w-full mx-4` override.

- **Animated score counter:** FEATURES.md recommends as a differentiator (~30 min, 15 lines). Not in critical path — include in Phase 6 only if Phase 1–5 complete cleanly.

- **Before/After rewrite teaser card:** FEATURES.md rates this as highest visual impact but 2h effort. Defer unless milestone timeline has slack.

- **Font wiring (LP-10):** `tailwind.config.ts` missing `fontFamily` extension for Inter. Low-risk fix but easy to forget — add it explicitly in Phase 2 when setting up Navbar.

---

## Sources

### Primary (HIGH confidence — direct codebase inspection)
- `frontend/app/page.tsx` — current 183-line upload state machine, confirmed `"use client"` at line 1
- `frontend/package.json` + `frontend/node_modules/` — confirmed `tailwindcss-animate@1.0.7` installed, `framer-motion`/`motion` NOT installed
- `frontend/tailwind.config.ts` — Tailwind v3.4.19, `darkMode: ["class"]` configured, no `fontFamily` extension
- `frontend/app/globals.css` — `prefers-reduced-motion` override at lines 38–46, CSS variable tokens `:root {}` present, `.dark {}` block ABSENT
- `frontend/components/upload/upload-zone.tsx` — confirmed clean `onFileSelected`/`disabled` API, self-contained, reusable as-is
- `frontend/app/layout.tsx` — Inter font loaded with `variable: "--font-inter"`, no ThemeProvider, no suppressHydrationWarning

### Secondary (HIGH confidence — stable domain knowledge)
- Next.js 15 App Router documentation — RSC/client component composition patterns, hydration behavior
- Radix UI `@radix-ui/react-dialog` — shadcn/ui standard primitive, confirmed `@radix-ui/react-sheet` is NOT a separate npm package (404)
- React 19 hydration — stricter mismatch detection than React 18; `whileInView` known failure mode
- Stripe.com, Vercel.com, Linear.app — reference implementations of minimal typography-first landing pages (cited in PROJECT.md)
- IntersectionObserver MDN — 97% browser support, no version concerns
- `tailwindcss-animate` animate-in/fade-in/slide-in-* utility classes — confirmed active in `page.tsx` line 110

### Tertiary (MEDIUM confidence — inform decisions, verify at implementation)
- `motion@^12.38.0` React 19 peer dependency claim (STACK.md) — plausible but moot since the package is not being used
- Exact Lighthouse score impact of 27KB Framer Motion bundle — estimated, not measured for this specific project

---

## Appendix: Original App Research (v1.0)

> The original full-stack app research (FastAPI, PostgreSQL, pgvector, LLM pipeline, etc.) has been archived below for reference. It is NOT the active research for this milestone.
>
> See the original SUMMARY.md content at git tag `v1.0-research` or in the research directory git history.

*The v1.0 architecture (async pipeline, NLP service, LLM abstraction, pgvector RAG) is the existing implemented system. This v2.0 milestone only touches the frontend landing page — the backend is unchanged.*

---

*Research synthesized: 2025-04-10*
*Milestone: v2.0 Seamless Homepage*
*Ready for roadmap: yes*
