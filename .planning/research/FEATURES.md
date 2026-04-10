# Feature Landscape

**Domain:** CV/Resume Analysis Tool — Landing Page Redesign (v2.0 Seamless Homepage)
**Researched:** 2026-04-10
**Confidence:** HIGH (landing page patterns are stable, well-documented; tool-specific claims from training data)

---

## ⚠️ Scope Note

This document covers **two separate concerns**:

1. **Original features** (Sections 1–3 below): Full CV Analyzer app feature landscape from initial research. Kept for historical context.
2. **Landing page features** (Sections 4–8 below): NEW research specifically for the v2.0 Seamless Homepage milestone. This is the active section.

---

## Landing Page Feature Research (v2.0 Milestone)

### Context

Existing app is functional (upload → analyze → 4-tab results). The homepage is a bare upload zone.  
Goal: Replace with a full landing page that (a) converts visitors to users and (b) signals AI Engineering competence to recruiters.

Primary audience: **Recruiters evaluating an AI Engineer candidate** — not typical SaaS buyers.  
Secondary audience: **Job seekers wanting CV feedback** — actual end users.

This dual audience shapes every copy and design decision below.

---

## Table Stakes (Landing Page)

Features any modern SaaS landing page visitor expects. Missing = feels like a demo, not a product.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Sticky Navbar with logo** | Orientation anchor; every landing page has one | Low | Logo left, single CTA right (`Analyze My CV`). No hamburger menu needed — no nav links to show. |
| **Hero headline + sub-headline** | Above-the-fold value statement; visitors decide in 3s | Low | Headline: outcome-first, ≤8 words. Sub-headline: 1–2 sentences on specifics. |
| **Primary CTA button (hero)** | The one action you want; must be unmissable | Low | Opens upload modal/drawer. Color: `primary` blue (already in CSS vars). Label: "Analyze My CV" or "Try It Free". |
| **Features section (3–4 items)** | Shows *what* the tool does before asking for upload | Low–Med | 3–4 cards with icon + title + 1 sentence. Outcomes, not technology. |
| **"How It Works" — 3-step flow** | Reduces friction/confusion before upload | Low | Numbered steps. Simple verb phrases. Upload → Analyze → Improve. |
| **Responsive layout** | 50%+ browsing on mobile, recruiters use phones | Medium | Single-column on mobile, grid on desktop. Max-width container. |
| **Consistent visual style** | Matches existing results page (shadcn + Tailwind) | Low | Already established: slate palette, Inter font, rounded corners. Don't introduce new tokens. |
| **Upload modal/drawer (CTA action)** | CTA must *do* something; existing UploadZone needs a container | Medium | shadcn Dialog wrapping existing `<UploadZone />`. Reuse existing component. |
| **Smooth scroll behavior** | Basic UX expectation; jarring jump feels broken | Low | `html { scroll-behavior: smooth }` one CSS line. |
| **Scroll entrance animations** | Every modern landing page has fade-in/slide-up; absence feels flat | Medium | Use `tailwindcss-animate` (already installed) + `IntersectionObserver`. Zero new deps. |

**Why these are table stakes:**
- Reference sites explicitly cited in PROJECT.md: Stripe, Notion. Both have all 10 above.
- Recruiters compare this to professional SaaS products they use daily.
- Missing any of these causes an immediate "looks unfinished" perception.

---

## Differentiators (Landing Page)

Features beyond baseline that signal "this developer knows what they're doing." For a portfolio project aimed at AI Engineer roles, differentiators are items that demonstrate technical and product thinking simultaneously.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Tech credibility badge in hero** | Signals AI stack to recruiters without a resume bullet point | Low | Small badge or caption below CTA: `"Powered by GPT-4o-mini · RAG · pgvector"`. Plain text or shadcn `Badge`. Recruiters hiring AI Engineers know these terms. |
| **Animated score counter on scroll** | "92/100" counting up when the Features card enters viewport creates visceral wow | Low | `useEffect` + `requestAnimationFrame` counter. ~15 lines of code. No library. Stops at a believable high score. |
| **Gradient text on hero headline keyword** | Stripe/Vercel/Linear all use this; instantly elevates perceived quality | Low | CSS: `bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent` on one keyword. Pure Tailwind. |
| **Feature card hover lift** | Micro-interaction communicates interactivity and polish | Low | `hover:-translate-y-1 hover:shadow-md transition-all duration-200`. Pure Tailwind. |
| **Step connector line ("How It Works")** | Visually shows flow, not just 3 isolated boxes | Low | CSS horizontal line between step circles on desktop. Hidden on mobile. Border-top trick or SVG. |
| **Trust strip below CTA** | Reduces friction via credibility signals; common in high-converting pages | Low | One line: `"No signup required · PDF & DOCX · Analysis in ~30s · Free"`. Muted small text. |
| **GitHub link in Navbar** | Recruiters WILL click it — direct pipeline from landing page to code | Low | `<a href="github.com/...">` with Github icon (Lucide). Secondary link, not primary CTA. |
| **Subtle dot-grid hero background** | Stripe uses this exact pattern. Adds depth without distraction | Low | CSS radial-gradient dot pattern. One CSS rule. Gives hero section an identity. |
| **Feature section "before/after" teaser** | Shows actual output — most visitors don't scroll to try the tool | Medium | Static card or screenshot showing a bullet point rewrite: `"Led team meetings"` → `"Led 6-person agile team, cutting deployment time 40%"`. Could be pure HTML/CSS mockup. |
| **Scroll-linked Navbar transparency** | Navbar starts transparent over hero, gains background on scroll — Stripe pattern | Low–Med | `useEffect` with `window.scrollY` listener. Changes Tailwind classes. |

**Why these differentiate for a portfolio AI project:**
- The tech badge addresses the **recruiter audience directly** — they scan for stack keywords, and this puts them front-and-center without requiring a scroll.
- The animated score counter provides **immediate evidence** the tool produces real output, not a loading spinner indefinitely.
- Gradient text + dot grid + hover lifts = **Stripe aesthetic** in ~30 minutes, zero new dependencies.
- GitHub link turns the landing page into a **direct portfolio funnel** — landing page → code repo → recruiter calls.

---

## Anti-Features (Landing Page) — Explicitly DO NOT Build

| Anti-Feature | Why Skip | What to Do Instead |
|--------------|----------|--------------------|
| **Framer Motion** | Adds ~40KB bundle, complex API, animatePresence overhead. `tailwindcss-animate` + IntersectionObserver handles 100% of required animations. | `tailwindcss-animate` + `animate-in` utility classes already in project. |
| **Testimonials section** | This is a portfolio project with no real users. Fake testimonials look fake. Recruiters ignore them. | Trust strip ("No signup required · Free") carries more credibility than invented quotes. |
| **Pricing section** | Free tool. A pricing section on a free tool creates confusion. | Single CTA repeated in footer area: "Try it free, no account needed." |
| **Video/GIF autoplay hero background** | Visually distracting, heavy on bandwidth, antithetical to Stripe/Notion minimal aesthetic referenced in project. | Dot-grid CSS background + gradient text achieves similar impact. |
| **Dark mode toggle in Navbar** | Would require full CSS variable audit and new token system. Not scoped to this milestone. Results page not dark-mode tested. | Ship in future milestone after results page is audited. |
| **Contact form / "Book a Demo"** | Portfolio project — no sales pipeline. Adds form handling complexity. | Link to LinkedIn or GitHub instead. |
| **Particle.js / canvas animations** | Over-engineered, visually busy, not the Stripe aesthetic. Screams "2018 portfolio". | Tailwind transitions are enough. |
| **Parallax scrolling** | Complex to implement well, causes jank on mobile, accessibility issues. One of the most common over-engineering traps for landing pages. | Fade-in/slide-up is sufficient and more refined. |
| **Cookie consent banner** | No tracking implemented. Would require a CMP library for GDPR. Out of scope for portfolio. | Skip entirely. Add `<meta>` no-index if desired to keep low-profile. |
| **Social proof counters ("10,000+ CVs analyzed")** | No real data. Fake numbers immediately signal inauthenticity to technical recruiters. | Use the tech badge instead — more credible signal for target audience. |
| **Drawer vs Dialog debate** | Vaul (shadcn Drawer) adds a dependency. Dialog is already standard and works on all viewports if implemented correctly. | Use `shadcn Dialog` with `max-w-lg`. Mobile: ensure `overflow-y-auto` and no viewport issues. |
| **AOS (Animate On Scroll library)** | Extra npm dependency for what 20 lines of IntersectionObserver code handles natively. | Custom `useInView` hook + Tailwind Animate. |

---

## Copy Patterns (AI Tool Landing Pages — 2024/2025 Patterns)

### Hero Headline Formulas

Ranked by effectiveness for this specific project + audience:

| Formula | Example for This Project | Best For |
|---------|--------------------------|----------|
| **Outcome + timeframe** | "Get expert CV feedback in 30 seconds" | Highest conversion — specific, believable |
| **Transform framing** | "Your CV, analyzed by AI. Improved by you." | Balanced — shows collaboration, not magic |
| **Recruiter POV** | "See your CV the way recruiters see it" | Strong — creates immediate relevance |
| **Action-oriented** | "Stop guessing. Start improving your CV." | Works well with impatient visitors |
| **Specificity signal** | "4-dimensional AI analysis. Zero fluff." | Best for technical audience (recruiters for AI roles) |

**Recommended headline for this project:**
```
"Your CV, analyzed by AI in seconds."
```
Sub-headline: `"Get multi-dimensional feedback on clarity, impact, ATS compatibility, and keyword strength. No account required."`

**Why this works:**
- "analyzed by AI" + "multi-dimensional" signals sophistication to recruiters
- "in seconds" = low commitment
- "No account required" = zero friction
- Lists real feature names (clarity, impact, ATS) = specific, not vague

### CTA Button Copy

| Label | Conversion Signal | When |
|-------|-------------------|------|
| **"Analyze My CV"** | Personal, action-specific | Primary hero CTA |
| **"Try It Free"** | Lowers commitment barrier | Secondary / repeat CTAs |
| **"Upload Your CV"** | Functional, direct | Inside modal header |
| **"Get Instant Feedback"** | Outcome-focused | Alternative hero CTA |

**Recommendation:** "Analyze My CV" for hero CTA (personal + action), "Try It Free" for repeated CTAs lower in page.

### Features Section Copy Pattern

Every feature card follows: **Icon + Outcome Title + 1 sentence benefit**.

❌ Bad: "Multi-dimensional scoring using NLP"
✅ Good: "**Score every dimension** — Measure clarity, impact, completeness, and keyword relevance separately."

❌ Bad: "LLM-based improvement suggestions"  
✅ Good: "**Rewrite suggestions that work** — See exact before/after rewrites for every weak bullet point."

### How It Works — Step Labels

Keep verb-first, ≤5 words per step:
1. **"Upload your CV"** — PDF or DOCX, no signup
2. **"AI analyzes 4 dimensions"** — 30 seconds of deep analysis  
3. **"Improve with precision"** — Specific rewrites, scores, and job match gaps

---

## "Wow Factor" Elements — Effort vs. Impact Matrix

Items with highest visual impact per hour of implementation:

| Element | Impact | Effort | Implementation |
|---------|--------|--------|----------------|
| Gradient text on hero keyword | High | 5 min | Pure Tailwind CSS |
| Animated score counter on scroll | High | 30 min | 15 lines JS, no deps |
| Dot-grid hero background | Medium-High | 10 min | 3 lines CSS |
| Feature card hover lift | Medium | 5 min | Tailwind `hover:` classes |
| Step connector line | Medium | 20 min | CSS border-top trick |
| Trust strip badges | Medium | 10 min | Static HTML/text |
| Scroll-linked navbar opacity | Medium | 30 min | `useEffect` scroll listener |
| Before/after rewrite teaser card | High | 1–2 hr | Static HTML mockup card |
| IntersectionObserver fade-in | High | 45 min | Custom `useInView` hook |
| Tech badge in hero | Medium-High | 10 min | shadcn `Badge` component |

**Highest ROI picks (do first):**
1. Gradient text — 5 min, looks premium
2. Dot-grid background — 10 min, hero identity
3. Trust strip — 10 min, converts fence-sitters
4. Tech badge — 10 min, direct recruiter signal
5. Animated counter — 30 min, the "wow" moment

---

## Section Structure Recommendation

Based on high-converting SaaS patterns (Stripe, Linear, Vercel) and portfolio-specific goals:

```
[Navbar]
  - Logo/name (left)
  - GitHub icon link (right, secondary)
  - "Analyze My CV" button (right, primary)

[Hero Section]
  - Pre-headline badge: "GPT-4o-mini · RAG · pgvector"
  - Headline (gradient text on keyword): "Your CV, analyzed by AI in seconds."
  - Sub-headline: specific value prop (2 sentences max)
  - CTA: "Analyze My CV" button (opens Dialog)
  - Trust strip: "No signup · PDF & DOCX · Free · ~30s"
  - Dot-grid background

[Features Section]  ← fade-in on scroll
  - Section label: "What you get" or "Capabilities"
  - 3–4 cards in grid: icon + title + 1 sentence
  - Feature 1: AI Scoring (animated counter)
  - Feature 2: Improvement Suggestions (before/after teaser)
  - Feature 3: Job Role Comparison
  - Feature 4: PDF Export (optional 4th card)

[How It Works Section]  ← slide-up on scroll
  - Section label: "How it works"
  - 3 numbered steps with icons + connector line
  - Step CTA: "Analyze My CV" button (repeat)

[CTA Section / Footer]  ← fade-in on scroll
  - Short closing line: "Ready to improve your CV?"
  - CTA button (repeat)
  - Footer: links (GitHub, LinkedIn), built-with credits
```

---

## Implementation Approach (Next.js + shadcn/ui + Tailwind)

### Scroll Animations: Zero New Dependencies

```typescript
// hooks/use-in-view.ts
import { useEffect, useRef, useState } from "react";

export function useInView(options = { threshold: 0.15 }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect(); // fire once
      }
    }, options);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}
```

Usage: `className={cn("transition-all duration-700", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}`

Already available in `tailwindcss-animate`:
```
animate-in fade-in slide-in-from-bottom-8 duration-700
```
But IntersectionObserver is needed to *trigger* on scroll (Tailwind Animate only controls the animation itself, not when it fires).

### Upload Modal: shadcn Dialog (No New Deps Needed)

```typescript
// Wrap existing <UploadZone /> in Dialog:
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="sm:max-w-[600px]">
    <DialogHeader>
      <DialogTitle>Upload Your CV</DialogTitle>
    </DialogHeader>
    <UploadZone onFileSelected={handleFile} />
  </DialogContent>
</Dialog>
```

Dialog component needs to be added via `npx shadcn@latest add dialog` — one command, no manual work.

### Gradient Hero Text: Pure Tailwind

```tsx
<h1 className="text-4xl font-bold tracking-tight">
  Your CV, analyzed by{" "}
  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
    AI
  </span>{" "}
  in seconds.
</h1>
```

### Dot-Grid Background: Pure CSS

```css
.hero-section {
  background-image: radial-gradient(circle, #cbd5e1 1px, transparent 1px);
  background-size: 24px 24px;
}
```

---

## Feature Dependencies (Landing Page)

```
Navbar (no deps)
  └── Dialog open state → Upload Modal
         └── Existing <UploadZone /> component (reuse as-is)

Hero Section (no deps)
  └── Dialog trigger → Upload Modal

Features Section
  └── useInView hook (new, no deps)
  └── Animated counter (new, no deps)

How It Works (no deps except useInView)

useInView hook → shared by Features + HowItWorks + CTA sections
```

**Critical path:** Dialog → UploadZone wiring first. Everything else is presentational.

---

## Complexity Assessment (This Milestone)

| Component | Complexity | Est. Hours | Notes |
|-----------|------------|------------|-------|
| Navbar | Low | 1–2h | Static, scroll-linked opacity optional |
| Hero section | Low | 2–3h | Gradient text + dot grid + trust strip |
| Features section | Medium | 3–4h | 4 cards + animated counter + useInView |
| How It Works | Low | 2h | 3 steps + connector line + useInView |
| Upload modal (Dialog) | Low | 1h | `shadcn add dialog` + wrap UploadZone |
| useInView hook | Low | 0.5h | 15-line custom hook |
| CTA / Footer | Low | 1h | Repeat button + links |
| Before/After teaser card | Medium | 2h | Static mockup, high visual impact |
| **Total** | **Low–Med** | **~13–15h** | Well within 1-week scope |

---

## MVP Recommendation (Landing Page)

**Must have (Phase 1 — this milestone):**
1. Navbar (logo + GitHub link + CTA button)
2. Hero (headline + sub-headline + CTA + trust strip)
3. Features (4 cards with icons)
4. How It Works (3 steps)
5. Upload Dialog (CTA opens modal with UploadZone)
6. useInView scroll animations (fade-in, slide-up)
7. Gradient text + dot-grid + hover lifts (5-minute wins)

**Nice to have (finish if time allows):**
- Animated score counter in Features card
- Before/After rewrite teaser card
- Scroll-linked navbar opacity

**Defer:**
- Dark mode (requires results page audit)
- Real screenshot/demo in hero (needs captured output)
- Footer with full links (minimal placeholder is fine)

---

## Portfolio-Specific Recruiter Signals

This project is explicitly a portfolio piece for AI Engineer roles. The landing page itself is a portfolio artifact. Design it to communicate:

| Signal | How to Show It |
|--------|----------------|
| **Technical depth** | Tech badge ("GPT-4o-mini · RAG · pgvector") in hero pre-headline |
| **Product thinking** | Outcome-focused copy ("Land more interviews") over tech-focused copy |
| **Code quality awareness** | GitHub link in Navbar — invite inspection |
| **Modern frontend skills** | shadcn/ui components + Tailwind + smooth animations — no jQuery, no Bootstrap |
| **UX sensibility** | Stripe aesthetic (whitespace, typography, minimal color) shows taste |
| **No-nonsense scope** | "No account required" shows confidence, not laziness — portfolio projects with auth often feel forced |

---

## Sources

**Confidence: HIGH** for structure/copy/pattern recommendations — landing page patterns are stable and well-documented in published conversion research.  
**Confidence: MEDIUM** for specific tool suggestions (IntersectionObserver approach, shadcn Dialog) — based on training data, verified against project's existing `package.json` which shows `tailwindcss-animate` is already installed.

Key reference points:
- Stripe.com, Vercel.com, Linear.app, Framer.com — reference implementations of "minimal typography-first" landing pages mentioned in PROJECT.md
- shadcn/ui Dialog docs pattern: https://ui.shadcn.com/docs/components/dialog
- IntersectionObserver MDN: standard browser API, no verification needed
- PROJECT.md explicitly references Stripe/Notion style and lists all 7 landing page requirements (LANDING-01 through LANDING-07)
- Existing `package.json` confirms: `tailwindcss-animate` installed, `lucide-react` installed, no Framer Motion — validates zero-new-deps animation approach

---

*Last updated: 2026-04-10 — v2.0 Seamless Homepage milestone*

---

## Original Feature Research (Pre-Landing Page — Historical)

> The content below is from the original app feature research (2026-04-03). Kept for reference.
> Active research for this milestone is the landing page sections above.

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **File Upload & Parsing** | Users need to submit CVs for analysis | Medium | PDF/DOCX parsing required; OCR for scanned PDFs is expected |
| **Overall CV Score** | Users expect a quick assessment metric | Low | Simple 0-100 scoring algorithm; foundational feature |
| **Keyword/ATS Matching** | Core value prop - will CV pass ATS? | Medium | Job description comparison; skill extraction & matching |
| **Grammar & Spelling Check** | Basic expectation for any text analysis tool | Low | Built-in to most LLMs; expected baseline |
| **Formatting Validation** | ATS can't read poorly formatted CVs | Medium | Check for tables, columns, images that break parsing |
| **Section Detection** | Identify header, experience, education, skills | Medium | NLP-based section parsing; critical for structured analysis |
| **Improvement Suggestions** | Actionable feedback is the core value | High | LLM-based generative feedback; requires prompt engineering |
| **Download/Export Results** | Users want to keep analysis | Low | PDF export or copyable text; basic feature |
| **Responsive Design** | 50%+ traffic from mobile | Medium | Mobile-first UI; expected for modern web apps |
| **Loading States** | Async processing needs feedback | Low | Progress indicators; streaming updates ideal |

**Why these are table stakes:**
- Every competitor (Jobscan, Rezi, Resume Worded, LinkedIn Resume Review) offers these
- User workflow fundamentally requires: upload → analyze → get score → see improvements → download
- Missing any of these makes the tool feel "broken" or incomplete

## Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Multi-Dimensional Scoring** | Beyond single score: clarity, impact, completeness, keyword relevance | High | 4-6 distinct scoring dimensions; demonstrates AI sophistication |
| **Impact Metrics Analysis** | Quantifies achievements (numbers, %, results) | High | NER for metrics; LLM reasoning to assess impact quality |
| **Action Verb Enhancement** | Specific suggestions to strengthen bullet points | Medium | LLM generation; corpus of strong verbs |
| **Real-Time Streaming Analysis** | Show AI thinking; reduce perceived latency | High | SSE/WebSocket streaming; impressive for portfolio |
| **Skills Gap Heatmap** | Visual representation of missing vs present skills | Medium | Visualization; compare CV against job description |
| **RAG-Powered Best Practices** | Retrieve industry-specific CV writing guidance | High | Vector DB of successful CVs; semantic search |
| **Role-Specific Scoring** | Tailor analysis to specific job families (SE, PM, Design) | Medium | Custom rubrics per role; shows AI adaptability |
| **Before/After Comparison** | Show how changes affect score | High | Diff visualization; encourages iteration |
| **Anonymous Benchmarking** | "Your score vs others in similar roles" | Medium | Aggregate analytics; privacy-preserving |
| **Section Balance Analysis** | Are you over/under-emphasizing experience vs skills? | Medium | Content distribution analysis; unique insight |
| **Achievement Highlighter** | Identifies strongest accomplishments to emphasize | Medium | Sentiment + impact analysis; boosts confidence |
| **LinkedIn Profile Import** | Pull data from LinkedIn URL | Medium | OAuth integration; convenience feature |

**Why these differentiate:**
- Most tools only do single-score + keyword matching
- Multi-dimensional analysis shows deeper AI understanding
- Streaming responses showcase technical sophistication
- RAG with best practices is cutting-edge (2025-2026)
- Visualizations (heatmap, before/after) create memorable UX

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **User Authentication (v1)** | Adds complexity, friction for anonymous portfolio showcase | Public access, no login required; focus on AI capabilities |
| **Payment Processing** | Free portfolio project; Stripe integration overkill | Free usage; showcase technical depth instead of monetization |
| **Real-Time Collaboration** | WebSocket management adds complexity; out of scope | Single-user analysis; async file upload |
| **Video CV Analysis** | Video processing, transcription complexity | Text-only analysis (PDF/DOCX); specialized feature |
| **Mobile App** | Native development duplicates effort; web is sufficient | Responsive web UI; PWA optional later |
| **Social Sharing Integrations** | LinkedIn/Twitter APIs add maintenance | Copy-to-clipboard results; user handles sharing |
| **Multiple Language Support** | Localization complexity for portfolio | English-only; marketable to English-speaking recruiters |
| **Resume Templates Library** | Template creation/maintenance is separate product | Focus on analysis, not creation |
| **Interview Preparation** | Different product domain | Stick to CV analysis; clear scope |
| **Salary Negotiation Tips** | Out of scope for CV analyzer | Focus on resume improvement only |

**Why these are anti-features:**
- Portfolio project should showcase AI engineering, not full-scale SaaS
- Authentication/payments distract from technical demonstration
- Each anti-feature adds 20-40% development time for marginal portfolio value
- Clear scope boundaries impress more than bloated features

## Feature Dependencies

```
File Upload → Section Detection → Multi-Dimensional Scoring → Improvement Suggestions
                                                        ↓
                                    Action Verb Enhancement ← Impact Metrics Analysis
                                                        ↓
                                      Before/After Comparison → Iteration

Job Description → Keyword/ATS Matching → Skills Gap Heatmap
                                              ↓
                                Role-Specific Scoring (custom rubrics)

Section Detection → RAG Best Practices (retrieve relevant sections)
```

**Critical path:**
1. Must start with: File Upload + Parsing + Section Detection
2. Core value unlocked by: Multi-Dimensional Scoring + Improvement Suggestions
3. Differentiation requires: Streaming + RAG + Visualizations

**Parallel opportunities:**
- Role-Specific Scoring can be built alongside Multi-Dimensional Scoring
- Skills Gap Heatmap can be added once Keyword Matching works
- Before/After Comparison is UI layer on top of scoring

## MVP Recommendation

**Phase 1 (MVP - Table Stakes + 1 Differentiator):**
1. File Upload & Parsing (PDF/DOCX)
2. Overall CV Score
3. Section Detection
4. Grammar & Spelling Check
5. Formatting Validation
6. Improvement Suggestions (basic)
7. Download Results
8. Responsive Design
9. **Multi-Dimensional Scoring** (primary differentiator)

**Why this MVP:**
- Covers 100% of table stakes expectations
- Multi-dimensional scoring immediately differentiates from competitors
- Demonstrates AI sophistication (LLM + NLP)
- Buildable in 2-3 weeks for portfolio
- Leaves room for streaming/RAG in Phase 2

**Phase 2 (Enhanced Differentiation):**
1. Real-Time Streaming Analysis (technical showcase)
2. Impact Metrics Analysis
3. Action Verb Enhancement
4. Skills Gap Heatmap
5. Before/After Comparison

**Phase 3 (Advanced Polish):**
1. RAG-Powered Best Practices
2. Role-Specific Scoring
3. Achievement Highlighter
4. Anonymous Benchmarking
5. LinkedIn Profile Import (if time permits)

**Defer:**
- Video CV Analysis (specialized product)
- Mobile App (web is sufficient)
- Multiple Languages (English portfolio is fine)
- Interview Preparation (different domain)

## Complexity Assessment

| Complexity | Features |
|------------|----------|
| **Low** (1-3 days) | Overall score, grammar check, download, responsive design, loading states |
| **Medium** (1-2 weeks) | File upload, section detection, keyword matching, formatting check, skills heatmap, visualization |
| **High** (2-4 weeks) | Multi-dimensional scoring, improvement suggestions, impact metrics, streaming, RAG, role-specific scoring |

**Total estimated effort:**
- MVP (Phase 1): 4-6 weeks
- Phase 2: +3-4 weeks
- Phase 3: +3-4 weeks

## Competitive Landscape

**Market Leaders (2025-2026):**
- **Jobscan**: ATS-focused, keyword matching, job description comparison
- **Rezi.ai**: AI-powered writing, ATS optimization, LinkedIn import
- **Resume Worded**: Actionable feedback, LinkedIn scanner
- **LinkedIn Resume Review**: Free basic analysis, limited depth
- **Zety**: Resume builder + analyzer combo

**Common gaps in competitors:**
- Single-dimensional scoring (just "ATS compatibility")
- Limited or no streaming responses
- Generic feedback (not role-specific)
- No RAG or knowledge retrieval
- Poor visualization of results

**Our portfolio advantage:**
- Modern tech stack (FastAPI + Next.js + shadcn/ui)
- Real-time streaming (shows async/AI knowledge)
- Multi-dimensional analysis (shows LLM sophistication)
- RAG architecture (shows vector DB knowledge)
- Production deployment (shows DevOps skills)

## Sources

**Confidence: MEDIUM** (based on training data; rate limiting prevented current web verification)

General knowledge of CV analysis landscape (2024-2026):
- Competitor analysis from training data: Jobscan, Rezi, Resume Worded
- Standard ATS parsing expectations and limitations
- Common NLP techniques for resume analysis
- Industry best practices for resume scoring

**Unable to verify (rate limiting):**
- Current 2026 feature sets of specific tools
- Recent feature additions or pivot directions
- Current pricing models and limitations
- Recent user reviews and feedback

**Research flags for phases:**
- Phase 1: Verify competitor scoring dimensions before finalizing
- Phase 2: Check if streaming responses are now standard in 2026
- Phase 3: Confirm RAG for resumes is novel or commoditized
