# Domain Pitfalls

**Domain:** CV/Resume Analyzer with AI/NLP
**Researched:** 2026-04-03 (v1) | Updated: 2026-04-10 (v2.0 Landing Page milestone)

---

## ⚠️ v2.0 Landing Page Pitfalls (Current Milestone)

> **Scope:** Pitfalls specific to adding scroll animations and a landing page to the *existing* Next.js 15 + React 19 + shadcn/ui codebase. Each pitfall includes the exact file/line where the risk lives.

---

### CRITICAL: LP-1 — `"use client"` Boundary Pollution Kills RSC Benefits

**What goes wrong:** The current `app/page.tsx` has `"use client"` at line 1. When landing sections (Hero, Features, How It Works) are added to this file, every static word of copy becomes client-side JavaScript. The entire landing page ships as JS bundle instead of server-rendered HTML.

**Why it happens:**
- Developer adds sections directly to the existing `page.tsx` without noticing the `"use client"` directive
- Sections feel like they "work" (they do), but Next.js silently sends all static content as JS
- The React tree below a `"use client"` boundary cannot contain Server Components

**Consequences:**
- LCP regression: static hero text that could be server-rendered HTML waits for JS hydration
- Bundle size balloons: every landing section's JSX goes into the client bundle
- No SEO benefit from static landing copy (crawlers get empty HTML, then JS)
- Contradicts portfolio goal of "demonstrating production-ready Next.js"

**Prevention:**
```
CORRECT ARCHITECTURE:
app/page.tsx               ← Server Component (remove "use client")
├── <HeroSection />        ← Server Component (static copy, no interactivity)
├── <FeaturesSection />    ← Server Component (static copy)
├── <HowItWorksSection />  ← Server Component (static copy)
├── <UploadModal />        ← Client Component (needs useState, SSE, router)
└── <AnimatedWrapper />    ← Client Component (needs browser APIs for animation)

"use client" stays in the LEAF components that need it, not the page root.
```

**Actionable fix:**
1. Remove `"use client"` from `app/page.tsx`
2. Extract upload state machine into `components/upload/upload-modal.tsx` with `"use client"`
3. Create `components/landing/animated-section.tsx` with `"use client"` as a thin animation wrapper
4. Static section content files (Hero, Features, HowItWorks) have NO `"use client"`

**Phase:** LANDING-04 (upload modal) + LANDING-05 (animations) — address in Phase 1 of the milestone

**Warning sign:** Running `next build` and seeing `app/page.tsx` listed as a large client bundle (>50KB) when landing copy is all static text.

---

### CRITICAL: LP-2 — Upload State Machine Breaks When Moved to Modal

**What goes wrong:** The upload flow in `app/page.tsx` is a 5-state machine (idle → file-selected → uploading → processing → complete) with an SSE hook (`useJobStream`), a React Query mutation (`useUpload`), and a `router.push()` call. When this is extracted to a `<UploadModal>` component, closing the modal destroys the component, which destroys the SSE `EventSource` connection mid-stream.

**Why it happens:**
- Modal unmount triggers React's cleanup: `useEffect` returns `() => connection.close()` in `use-job-stream.ts` line 69
- User opens modal, starts upload, SSE connects → user accidentally closes modal → `connection.close()` fires → stream dies → job completes server-side but frontend never knows → user is stuck

**Consequences:**
- Silent data loss: analysis completes but user never sees results
- Impossible to recover without knowing the `job_id`
- `router.push()` at line 114 in `page.tsx` called from inside a modal = race condition if modal is unmounting

**Prevention — three options, ranked:**

Option A (recommended): **Prevent close during active processing**
```tsx
// In UploadModal component
<Dialog open={isOpen} onOpenChange={(open) => {
  // Block close if upload is in-flight or SSE is connected
  if (!open && (isProcessing || isConnected)) return;
  setIsOpen(open);
}}>
```

Option B: **Lift job state to parent (page)**
```tsx
// page.tsx manages jobId state, passes it to UploadModal
// Modal closing doesn't destroy SSE hook because hook lives in page
const [activeJobId, setActiveJobId] = useState<string | null>(null);
<UploadModal onJobStart={setActiveJobId} />
{/* SSE hook lives HERE in the Server Component page, not in modal */}
```

Option C: **Persist jobId to sessionStorage**
```tsx
// If modal unmounts, on remount check sessionStorage for in-progress job
useEffect(() => {
  const savedJobId = sessionStorage.getItem('active_job_id');
  if (savedJobId) setJobId(savedJobId);
}, []);
```

**Recommended:** Option A for simplicity (landing page CTA modal, users won't accidentally close during processing). Add a visible "Processing — please don't close this window" message.

**Phase:** LANDING-04 (upload modal) — must address before any testing

**Warning sign:** `use-job-stream.ts` cleanup function fires during active processing. Check with React DevTools → component tree → watch for UploadModal unmounting while `isConnected = true`.

---

### CRITICAL: LP-3 — Dark Mode CSS Variables Are Undefined (Partial Implementation)

**What goes wrong:** `tailwind.config.ts` has `darkMode: ["class"]` configured (line 3), and `globals.css` uses CSS variable tokens like `hsl(var(--background))` — but there is NO `.dark { }` block in `globals.css`. The dark mode CSS variables don't exist. Any new landing section using dark mode semantics will render incorrectly.

**Why it happens:**
- shadcn/ui was set up but dark mode variables were never added to `globals.css`
- Developer adds `dark:bg-background` to a hero section thinking it will work → it technically renders but `--background` doesn't change in dark mode
- `layout.tsx` has no `ThemeProvider` and no `suppressHydrationWarning` on `<html>`

**Consequences:**
- Hero sections with dark backgrounds (`bg-gray-900`) work via Tailwind utilities but semantic tokens (`bg-background`, `text-foreground`) don't respond to theme toggle
- Two theming systems emerge: landing sections use raw Tailwind classes, result pages use semantic tokens → visual inconsistency
- If dark mode toggle is added later, hydration mismatch on the class attribute of `<html>` (server renders without `dark` class, client adds it)

**What the code currently has:**
```css
/* globals.css — ONLY light mode vars, no .dark {} block */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... */
}
/* MISSING: .dark { --background: 222.2 84% 4.9%; --foreground: 0 0% 100%; } */
```

**Prevention — for this milestone (no dark mode toggle required):**
- Use ONLY semantic token classes (`bg-background`, `text-foreground`, `text-muted-foreground`) for all landing sections
- Do NOT use raw Tailwind color classes (`bg-slate-50`, `text-gray-900`) in new sections — this creates the two-systems problem
- Do NOT add dark-mode-specific `dark:` classes unless the full dark mode implementation (`.dark {}` vars + ThemeProvider) is done in the same task

**If dark mode toggle is a future feature (Out of Scope for v2.0):**
1. Add `.dark {}` CSS variable block to `globals.css` before any `dark:` classes are used
2. Install `next-themes`, wrap `layout.tsx` body with `<ThemeProvider>`
3. Add `suppressHydrationWarning` to `<html>` tag in `layout.tsx`

**Phase:** LANDING-06 (style consistency) — address upfront, before writing any section CSS

**Warning sign:** New section has `dark:` class but `globals.css` still has no `.dark { }` block. Or, landing section uses `bg-slate-50` while result pages use `bg-background` — these will diverge.

---

### HIGH: LP-4 — Framer Motion Hydration Mismatch in React 19

**What goes wrong:** Framer Motion's `motion.div` components compute initial animation states using browser APIs (`window`, `IntersectionObserver`, `matchMedia`). Server renders plain HTML. Client hydration re-renders with animation props applied. React 19 is **stricter** than React 18: it throws actual errors on hydration mismatches rather than silently patching them.

**Specific failure modes:**
- `whileInView` prop: triggers `IntersectionObserver` on client → server has no such concept → server renders element as visible, client renders it as hidden → mismatch
- `AnimatePresence` with conditional children: server/client may render different children during initial hydration if upload state differs
- `motion.div` with `layoutId`: uses DOM measurements (client-only) that don't exist server-side

**React 19 specific:** The new `useId`-based reconciliation in React 19 catches more mismatches. Framer Motion >= 11 has better React 19 support but `whileInView` still causes issues in SSR contexts unless wrapped correctly.

**Prevention:**
```tsx
// WRONG: motion.div directly in a Server Component or SSR'd context
<motion.div whileInView={{ opacity: 1 }} initial={{ opacity: 0 }}>
  <HeroSection />
</motion.div>

// CORRECT Option A: Wrap in a "use client" boundary
// components/landing/fade-in.tsx
"use client";
import { motion } from "framer-motion";
export function FadeIn({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}

// CORRECT Option B: Use CSS animations instead (recommended for this project)
// tailwindcss-animate is ALREADY installed. Use animate-in classes:
<div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
  <HeroSection />
</div>
// Zero JS, zero hydration issues, triggered by Intersection Observer via CSS @keyframes
```

**Recommendation for this project:** Use `tailwindcss-animate` (already in `package.json`) + CSS `@keyframes` triggered by an `IntersectionObserver`-based CSS class toggle. This gives 0 additional JS bundle impact and no hydration risk. Reserve Framer Motion only if complex gesture interactions or `AnimatePresence` enter/exit transitions are required.

**Phase:** LANDING-05 (scroll animations) — choose animation strategy before implementation

**Warning sign:** `Error: Hydration failed because the server rendered HTML didn't match the client.` in browser console after adding `motion.*` components.

---

### HIGH: LP-5 — `IntersectionObserver` and `window` Used Outside `useEffect`

**What goes wrong:** Scroll-triggered animation hooks often access `IntersectionObserver`, `window.scrollY`, or `document.querySelector` at the module level or during render. In Next.js 15 App Router, any component that isn't explicitly `"use client"` runs during SSR in Node.js, which has none of these.

**Specific patterns that fail:**
```tsx
// WRONG: Accessing window outside useEffect
const [isVisible, setIsVisible] = useState(window.innerWidth > 768); // SSR crash

// WRONG: Creating IntersectionObserver during render
const observer = new IntersectionObserver(callback); // ReferenceError on server

// WRONG: react-intersection-observer with useInView in a Server Component
import { useInView } from "react-intersection-observer"; // hooks require "use client"
```

**Prevention:**
```tsx
// CORRECT: Guard with useEffect
const [isVisible, setIsVisible] = useState(false);
useEffect(() => {
  const observer = new IntersectionObserver(([entry]) => {
    setIsVisible(entry.isIntersecting);
  });
  observer.observe(ref.current!);
  return () => observer.disconnect();
}, []);

// CORRECT: Mark the component as client-only
"use client";
import { useInView } from "react-intersection-observer";

// CORRECT: Use CSS-only approach with tailwindcss-animate
// Triggered by adding a class via IntersectionObserver in a single
// "use client" utility component, or with CSS scroll-driven animations
```

**CSS-only scroll animation approach (Next.js 15, zero-JS):**
```css
/* globals.css — add scroll-driven animation */
@supports (animation-timeline: scroll()) {
  .animate-on-scroll {
    animation: fadeSlideIn 0.6s ease forwards;
    animation-timeline: view();
    animation-range: entry 0% entry 30%;
  }
}
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
```
Note: CSS scroll-driven animations have ~90% browser support (2025). Check caniuse.com for current support before using as sole approach.

**Phase:** LANDING-05 (scroll animations) — verify before writing any animation code

---

### HIGH: LP-6 — LCP Regression from Hero Section Changes

**What goes wrong:** The existing page has zero images and minimal DOM. Adding a landing page hero with a background image, large text gradients, or heavy SVG illustrations can dramatically increase Largest Contentful Paint (LCP), which is a Core Web Vital and affects both user experience and search ranking.

**Specific risks for this project:**
- Hero image above the fold: if not lazy-loaded (shouldn't be for LCP element) or not properly sized with `next/image` → LCP regression
- Text-based LCP: if the hero tagline is the LCP element and it's inside a `motion.div` with `initial={{ opacity: 0 }}`, the LCP element is invisible on server → LCP fires late
- Fonts: `layout.tsx` loads Inter from Google Fonts. If a hero section uses a different weight that wasn't preloaded, FOUT causes layout shift and LCP delay

**Prevention:**
- The LCP element (hero headline) must be server-rendered visible text — never hidden behind `initial={{ opacity: 0 }}` with Framer Motion unless using `LazyMotion` with proper SSR handling
- For hero images: use `<Image priority>` from `next/image` (Next.js 15 automatically generates correct `fetchpriority="high"` attribute)
- Keep hero animations on non-LCP elements (background, supporting text, CTA button), not the headline itself
- Prefer `opacity: 0 → 1` over layout-shifting animations (`height: 0 → auto`, `margin` changes) — only `opacity` and `transform` are compositor-safe

**Phase:** LANDING-01 (Hero) + LANDING-05 (animations) — design decision, not implementation detail

---

### MEDIUM: LP-7 — Scroll-Triggered Animation CLS (Cumulative Layout Shift)

**What goes wrong:** Animations using `transform: translateY()` and `opacity` are **CLS-safe** (don't affect layout). But common mistakes introduce CLS:

**CLS-causing animation patterns:**
```tsx
// WRONG: Animating height causes CLS
initial={{ height: 0 }}
animate={{ height: "auto" }}

// WRONG: Animating margin/padding causes CLS
initial={{ marginTop: 40 }}
animate={{ marginTop: 0 }}

// WRONG: Elements appearing with opacity:0 that reserve no space
// wait — opacity:0 DOES reserve space. But if using display:none, CLS happens
initial={{ display: "none" }}
// Fix: always use opacity:0, never display:none for animated elements
```

**CLS-safe patterns:**
```tsx
// CORRECT: Only transform and opacity
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
// transform: translateY doesn't affect document flow

// CORRECT: Pre-reserve space for dynamic elements
// If a card grid loads progressively, use skeleton placeholders
// to hold space before animation completes
```

**Additional CLS source:** The upload modal/drawer opening. If implemented as an inline drawer that pushes page content, it causes CLS. Use a fixed-position overlay Dialog (`shadcn/ui Dialog` component uses Radix Dialog Portal, which renders in a portal and does NOT cause CLS).

**Phase:** LANDING-04 (upload modal) + LANDING-05 (animations) — verify with Chrome DevTools Performance panel

---

### MEDIUM: LP-8 — Framer Motion Bundle Size (If Chosen)

**What goes wrong:** If the team decides to use Framer Motion despite the SSR concerns, importing it naively adds ~27KB gzipped to the JS bundle.

```tsx
// WRONG: Full Framer Motion import
import { motion, AnimatePresence } from "framer-motion"; // ~85KB min, ~27KB gzip

// CORRECT: LazyMotion with domAnimation feature set
import { LazyMotion, domAnimation, m } from "framer-motion";
// domAnimation = ~18KB min, ~6KB gzip
// Must wrap root with <LazyMotion features={domAnimation}>

// EVEN BETTER: Dynamic import for animation components
const AnimatedSection = dynamic(() => import('./animated-section'), {
  ssr: false // loads after initial page paint
});
```

**Project-specific context:** This is a portfolio project. Bundle size directly affects Lighthouse scores, which recruiters and interviewers may check. A 27KB increase for simple fade-in animations when `tailwindcss-animate` is already installed is hard to justify.

**Recommendation:** `tailwindcss-animate` covers LANDING-05's requirement (fade-in, slide-up entrance effects). No Framer Motion needed. If you must have AnimatePresence-style enter/exit for the upload modal, use `tailwindcss-animate`'s `data-[state=open]` / `data-[state=closed]` integration which shadcn/ui Dialog already implements.

**Phase:** Dependency decision must be made before LANDING-05

---

### MEDIUM: LP-9 — `prefers-reduced-motion` Partial Implementation

**What goes wrong:** `globals.css` has a `prefers-reduced-motion` CSS override (lines 38–46) that disables CSS animations. But if Framer Motion is used, its JS-driven animations are unaffected by this CSS rule.

**What's already correct:**
```css
/* globals.css lines 38-46 — this works for CSS animations */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**What's missing for Framer Motion:**
```tsx
// Framer Motion ignores CSS prefers-reduced-motion
// Must use its own hook:
"use client";
import { useReducedMotion } from "framer-motion";

function AnimatedSection({ children }) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      initial={shouldReduce ? {} : { opacity: 0, y: 20 }}
      animate={shouldReduce ? {} : { opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}
```

**If using CSS-only animations:** The existing `globals.css` override is sufficient. No additional code needed.

**Phase:** LANDING-05 — verify accessibility compliance before shipping

---

### LOW: LP-10 — Inter Font Variable Misconfiguration

**What goes wrong:** `layout.tsx` loads Inter with `variable: "--font-inter"` and applies `inter.variable` to `<html>`. But `tailwind.config.ts` has no `fontFamily` extension mapping `font-sans` to `var(--font-inter)`. The `body` uses `font-sans` (Tailwind's system font stack). New landing sections copying patterns from the codebase will get system fonts, not Inter.

**Evidence:**
```tsx
// layout.tsx line 8-12
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",  // sets CSS var --font-inter
});
// line 26: className={inter.variable} → adds --font-inter to <html>

// But tailwind.config.ts has NO:
// fontFamily: { sans: ["var(--font-inter)", ...defaultTheme.fontFamily.sans] }
// So font-sans still resolves to system fonts, not Inter
```

**Consequence:** Low visual impact (Inter and system sans-serif are similar) but inconsistent renders across devices. On Windows, system sans-serif is Segoe UI; on macOS it's San Francisco. The landing page might look different in screenshots from different OS.

**Prevention:**
```ts
// tailwind.config.ts — add fontFamily extension
theme: {
  extend: {
    fontFamily: {
      sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
    },
    // ... rest of extends
  }
}
```

**Phase:** LANDING-06 (style consistency) — minor fix, add when setting up typography

---

### LOW: LP-11 — Upload Zone Re-render on Landing Page Scroll

**What goes wrong:** The existing `page.tsx` renders the upload zone as the primary page content. When refactored into a landing page, if the upload state (`selectedFile`, `jobId`) lives in the parent page component and the page re-renders on scroll (e.g., from a scroll-position hook used for navbar transparency), the upload zone and state machine re-render unnecessarily.

**Prevention:**
- Use `React.memo` on the `<UploadModal>` component if it's the child of a component with scroll state
- Keep scroll state (navbar show/hide) in a separate context or local to the Navbar component, not in the page root
- Better: a `"sticky"` CSS navbar doesn't need JS scroll state at all

**Phase:** LANDING-07 (navbar) — minor, but easy to prevent

---

## Phase-Specific Warnings — v2.0 Landing Page

| Phase / Task | Pitfall | Mitigation | Priority |
|---|---|---|---|
| **LANDING-01** Hero Section | LCP element hidden behind animation | Hero headline must be server-rendered visible | HIGH |
| **LANDING-04** Upload Modal | SSE stream destroyed on modal close | Disable modal close during active processing | CRITICAL |
| **LANDING-04** Upload Modal | State machine duplication | Lift `jobId` state to page; SSE hook lives outside modal | CRITICAL |
| **LANDING-05** Scroll Animations | Hydration mismatch from Framer Motion | Use `tailwindcss-animate` CSS approach; avoid Framer Motion | HIGH |
| **LANDING-05** Scroll Animations | SSR crash from `IntersectionObserver` | All animation code in `"use client"` components | HIGH |
| **LANDING-05** Scroll Animations | CLS from layout-shifting animations | Only animate `opacity` and `transform`, never `height`/`margin` | MEDIUM |
| **LANDING-05** Scroll Animations | `prefers-reduced-motion` bypass | CSS approach respects existing override; add `useReducedMotion()` if using Framer Motion | MEDIUM |
| **LANDING-06** Style Consistency | Dark mode token gap | Use semantic tokens only; no `.dark:` classes until `.dark {}` vars added | CRITICAL |
| **LANDING-06** Style Consistency | Two-system Tailwind split | New sections use `bg-background`, never `bg-slate-50` | HIGH |
| **LANDING-06** Style Consistency | Inter font not wired to Tailwind `font-sans` | Add `fontFamily` extension to `tailwind.config.ts` | LOW |
| **LANDING-07** Navbar | Scroll state causing upload re-renders | Keep scroll state local to Navbar | LOW |
| **Any section** | `"use client"` pollution on page root | Remove `"use client"` from `page.tsx`; push to leaf components | CRITICAL |

---

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Brittleness to CV Format Variations

**What goes wrong:** System works perfectly on standard templates but fails catastrophically on creative layouts, international formats, or ATS-generated CVs. Parsing accuracy drops from 95% to 20% on edge cases.

**Why it happens:**
- Testing only on a small set of similar CVs during development
- Hard-coding section headers ("Experience", "Education") without alternatives
- Assuming left-to-right, top-to-bottom reading order
- Not handling multi-column layouts, tables, or creative spacing

**Consequences:**
- Users get garbage analysis or system crashes
- Zero production value despite working on test data
- Complete rewrite of parsing pipeline needed
- Portfolio project fails to demonstrate robustness

**Prevention:**
- Build a diverse CV test corpus (20+ variations) early:
  - Different templates (creative, corporate, academic, European)
  - Different formats (PDF with columns, DOCX with tables, plain text)
  - International formats (different date formats, section names)
  - Edge cases (CVs with photos, graphs, multiple languages)
- Implement defensive parsing: when structure detection fails, fall back to raw text analysis
- Add parsing confidence scores; if low, notify user instead of hallucinating analysis
- Never hard-code section headers—use fuzzy matching and semantic detection
- Validate early with "worst-case" CVs, not just clean ones

**Detection:**
- Parsing fails on first real-world CV
- Empty or missing sections in analysis results
- User reports "my CV wasn't analyzed at all"
- Logs show repeated parsing exceptions

**Phase to address:** Phase 1 (Foundations) - Must establish robust parsing foundation before building analysis features on top

---

### Pitfall 2: LLM Hallucination in Analysis

**What goes wrong:** LLM invents skills, experiences, or qualifications that don't exist in the CV. Gives confident but completely fabricated feedback ("You have 5 years of Python experience" when CV shows 1 year).

**Why it happens:**
- Not anchoring LLM responses to extracted data
- Using creative/temperature-based prompting instead of strict extraction
- Not implementing structured output with validation
- Prompting for "helpful suggestions" without constraining to CV content

**Consequences:**
- Users lose trust instantly (one hallucination ruins credibility)
- Portfolio project demonstrates poor AI engineering
- Impossible to debug why analysis is wrong
- Legal/ethical issues if used in real hiring context

**Prevention:**
- Use structured outputs (JSON mode, function calling) with strict schemas
- Always ground LLM in extracted facts: "From these extracted skills [list], analyze..."
- Never use temperature >0 for analysis; only for suggestion generation
- Implement post-LLM validation: check that mentioned skills exist in extracted text
- Separate extraction (NLP/heuristic) from analysis (LLM) layers
- Add "confidence" field to analysis results; low confidence triggers human review notice
- Test with adversarial examples (empty CV, CV with fake job titles, etc.)

**Detection:**
- LLM mentions skills/jobs not in CV text
- Analysis contradicts CV content
- Impossible to trace analysis back to source text
- Users report "that's not on my CV"

**Phase to address:** Phase 2 (LLM Integration) - Critical to get right before exposing to users

---

### Pitfall 3: Ignoring PDF/Document Extraction Quality

**What goes wrong:** Assuming PDF/DOCX libraries produce perfect text. In reality: broken encoding, tables become word salad, headers/footers pollute text, images scanned as text.

**Why it happens:**
- Testing only with cleanly generated PDFs
- Not validating extraction quality before analysis
- Choosing wrong PDF library (text-only vs. OCR-aware)
- Not handling password-protected or corrupted files

**Consequences:**
- Garbage in, garbage out: LLM analyzes corrupted text
- System crashes on malformed PDFs
- Poor extraction quality masks as poor analysis quality
- Impossible to tell if bug is in extraction or analysis

**Prevention:**
- Add extraction quality checks early:
  - Text length vs. page count (too short = extraction failed)
  - Character encoding validation (detect mojibake)
  - Known bad patterns (repeated headers, footer text pollution)
- Extract with multiple libraries, compare results (consensus approach)
- Implement graceful degradation: if PDF fails, ask user for DOCX/plain text
- Log extraction metrics (success rate, avg text length, encoding issues)
- Never trust extraction output without validation
- Provide "re-upload with different format" option when extraction fails

**Detection:**
- Very short extracted text from multi-page CV
- Garbled characters or encoding issues
- Extracted text contains headers/footers repeated
- System crashes on certain PDFs

**Phase to address:** Phase 1 (Foundations) - Document extraction is the foundation; must be reliable before any analysis

---

### Pitfall 4: Synchronous Processing Blocking UI

**What goes wrong:** User uploads CV, browser freezes for 30 seconds while LLM analyzes, no feedback. Timeout errors, frustrated users, portfolio looks amateur.

**Why it happens:**
- Naive HTTP request/response for long-running LLM calls
- Not implementing async processing with job queue
- No progress updates or status indicators
- Underestimating LLM latency (especially with streaming)

**Consequences:**
- Terrible user experience
- Timeouts on large CVs or job comparisons
- Portfolio project fails to demonstrate production-ready patterns
- Can't scale to multiple users

**Prevention:**
- Implement async processing pattern from day one:
  - Upload → job ID → background processing → SSE/webhook updates
  - Never block HTTP request on LLM call
  - Use streaming responses (SSE) for real-time progress
- Add timeout protection (kill analysis after 60s)
- Implement job queue with rate limiting for LLM API costs
- Show clear progress: "Extracting skills...", "Analyzing experience...", "Generating suggestions..."
- Handle failed jobs gracefully (notify user, don't leave hanging)
- Design for 95th percentile latency, not happy path

**Detection:**
- Browser tab shows "loading" spinner for >10 seconds
- No progress feedback during analysis
- HTTP 504 Gateway Timeout errors
- UI becomes unresponsive during processing

**Phase to address:** Phase 1 (Foundations) - Async architecture is foundational; hard to retrofit later

---

### Pitfall 5: No Cost Control for LLM Usage

**What goes wrong:** Portfolio project works great until bill arrives. LLM costs explode from repeated calls, large context windows, or users hitting "analyze" button multiple times.

**Why it happens:**
- Not tracking token usage per request
- Not caching LLM results
- Allowing unlimited re-analysis without rate limiting
- Using expensive models (GPT-4) when cheaper ones suffice
- Not optimizing prompts for token efficiency

**Consequences:**
- Unexpected costs (can be $100+/month for portfolio project)
- Have to shut down project or add payment (defeats portfolio purpose)
- LLM calls become performance bottleneck
- Can't demo to recruiters (cost concerns)

**Prevention:**
- Implement token usage tracking from day one (log every LLM call)
- Cache analysis results by content hash (same CV = no re-analysis)
- Rate limit per IP (e.g., 5 analyses/hour)
- Use cheaper models for initial analysis, expensive only for final polish
- Implement prompt optimization (remove redundancy, use compression)
- Set hard budget limits (kill LLM calls after $X spent)
- Display "API costs" in admin dashboard
- Consider open-source models (Llama, Mistral) for non-production demos

**Detection:**
- LLM API bills increase month over month
- No visibility into token usage or costs
- Repeated analysis of same CV re-triggers LLM calls
- No rate limiting visible in code

**Phase to address:** Phase 2 (LLM Integration) - Must implement cost controls when adding LLM features

---

## Moderate Pitfalls

### Pitfall 1: Over-Engineering RAG for Simple Analysis

**What goes wrong:** Building complex RAG system with vector database when simple keyword matching would suffice. RAG adds latency, complexity, and maintenance without improving analysis quality.

**Prevention:**
- Start with keyword/similarity matching for "best practices" retrieval
- Only add RAG if semantic search proves insufficient
- Benchmark simple approach vs. RAG before committing
- Question: Are we retrieving enough unique knowledge to justify vector DB?

**Phase to address:** Phase 3 (Advanced Features) - Evaluate RAG need before implementing

---

### Pitfall 2: Not Handling Edge Cases in Job Description Comparison

**What goes wrong:** Job comparison works for standard descriptions but fails on:
- Multiple roles in one posting
- Vague requirements ("excellent communication skills")
- Conflicting requirements ("senior role" + "entry-level salary")

**Prevention:**
- Add pre-processing for job descriptions (detect multiple roles, separate requirements)
- Implement confidence scoring for matches
- Handle vague requirements with "unclear" flag
- Test with real job postings from different industries

**Phase to address:** Phase 3 (Job Comparison) - Test edge cases before releasing feature

---

### Pitfall 3: Ignoring Privacy and Data Retention

**What goes wrong:** Storing uploaded CVs indefinitely, no data deletion, PII in logs. Portfolio project becomes liability if shared publicly.

**Prevention:**
- Auto-delete uploaded files after analysis (24-72 hours)
- Never log full CV text; log only metadata
- Add clear privacy notice: "CVs deleted after analysis"
- Implement data retention policies
- Sanitize logs to remove PII (emails, phone numbers)

**Phase to address:** Phase 1 (Foundations) - Privacy must be designed in from start

---

### Pitfall 4: Brittleness to Non-English CVs

**What goes wrong:** System assumes English CVs, breaks on:
- Different date formats (DD/MM/YYYY vs. MM/DD/YYYY)
- Non-Latin characters (Chinese, Arabic, Cyrillic)
- Different section headers (German "Berufserfahrung", French "Expérience")

**Prevention:**
- Detect language early (text classification or header detection)
- Use locale-aware date parsing
- Build multilingual section header matching
- Test with international CVs before launch
- Graceful degradation: "Unsupported language, English analysis only"

**Phase to address:** Phase 1 (Foundations) - Internationalization must be planned early

---

## Minor Pitfalls

### Pitfall 1: Over-Confident Scoring Without Calibration

**What goes wrong:** System gives "7/10" score but no explanation of what 10/10 looks like. Users can't interpret scores.

**Prevention:**
- Show benchmarks: "Top 10% of CVs score 8+"
- Provide score explanations: "7/10 = Strong, missing quantified achievements"
- Show comparison to similar CVs

**Phase to address:** Phase 2 (Scoring System)

---

### Pitfall 2: No Feedback Loop for Analysis Quality

**What goes wrong:** Can't tell if analysis is helpful or not. No way to improve over time.

**Prevention:**
- Add "Was this helpful?" thumbs up/down
- Track which suggestions users act on
- Monitor common user corrections

**Phase to address:** Phase 4 (Improvements)

---

### Pitfall 3: Not Handling Malicious Inputs

**What goes wrong:** System crashes or produces nonsense when users upload:
- Malformed PDFs designed to break parsers
- Text files with 1MB of garbage
- Fake CVs with adversarial prompts

**Prevention:**
- File size limits (5MB max)
- File type validation (magic bytes, not just extension)
- Input sanitization (remove null bytes, control characters)
- Rate limiting per IP

**Phase to address:** Phase 1 (Foundations)

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| **Phase 1: Document Parsing** | Brittleness to format variations | Test with 20+ diverse CVs before moving on |
| **Phase 1: Async Architecture** | Synchronous processing blocking UI | Implement SSE/job queue from day one |
| **Phase 2: LLM Integration** | Hallucination in analysis | Use structured outputs, validate against extracted text |
| **Phase 2: Cost Control** | Uncontrolled LLM costs | Track tokens, cache results, rate limit from start |
| **Phase 3: Job Comparison** | Edge cases in job descriptions | Test with real job postings, handle vague requirements |
| **Phase 4: Production** | Privacy/data retention issues | Auto-delete uploads, sanitize logs, add privacy notice |

---

## Sources

**Note:** Research completed 2026-04-03. Primary search tools were rate-limited, so findings are based on:
- Domain expertise in CV parsing and NLP systems
- Common patterns in AI/ML production failures
- Known challenges in document processing and LLM integration
- Standard pitfalls in resume analysis systems

**Confidence:** MEDIUM — Findings based on established domain knowledge and common production patterns. Web search tools were unavailable for verification, but all pitfalls reflect well-documented issues in CV parsing and LLM-based analysis systems.

**Key areas for validation during implementation:**
- Real-world CV format diversity (test corpus needed)
- LLM hallucination rates with chosen prompting strategy
- Actual token costs and latency with selected models
- PDF extraction quality with chosen library stack
