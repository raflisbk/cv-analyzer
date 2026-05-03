# Architecture Research: Landing Page Integration

**Domain:** Next.js 15 App Router — Homepage Landing Page Redesign
**Researched:** 2026-04-10
**Confidence:** HIGH (based on direct codebase inspection)

---

## Context: What Exists Today

### Current `app/page.tsx` — The Problem to Solve

The existing homepage is a **monolithic client component** implementing a 4-state upload flow:

```
idle → file-selected → uploading/processing → complete | failed
```

It renders different UI per state (UploadZone → DocumentPreview → ProcessingStages → completion card) and manages all state internally:
- `selectedFile`, `jobId`, `completedJobId`, `isNavigating`
- Calls `useUpload()` and `useJobStream()` hooks
- Navigates to `/results/[job_id]` on completion

**Key constraint:** This logic must be preserved exactly — it is battle-tested and wired to the backend SSE stream.

### What `UploadZone` Gives Us for Free

`components/upload/upload-zone.tsx` has a clean, minimal API:
```typescript
interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}
```
- Handles drag-and-drop, file picker, validation (PDF/DOCX, 5MB), error toasts
- Self-contained "use client" component
- **Reusable as-is inside a modal** — zero changes needed

### Existing Tech That Affects Architecture

| Item | Finding | Impact |
|------|---------|--------|
| `tailwindcss-animate` installed | YES (v1.0.7) | Use for scroll animations, no new deps |
| `framer-motion` installed | **NO** | Must decide: add it or use CSS approach |
| `@radix-ui/react-dialog` | **NOT installed** | Must add for upload modal |
| `tailwindcss-animate` already used | YES — `animate-in fade-in slide-in-from-bottom-2` in page.tsx | Stay consistent |
| `prefers-reduced-motion` | Already in `globals.css` | CSS animations auto-respect it |
| `app/layout.tsx` | Server Component, no Navbar | Navbar goes in landing page, not root layout |

---

## Recommended Architecture

### Core Decision: How to Restructure `page.tsx`

**Three options considered:**

| Option | Approach | Verdict |
|--------|----------|---------|
| A: In-place refactor | Bolt landing sections onto existing page.tsx | ❌ Creates 400+ line monolith mixing concerns |
| B: Replace with RSC shell + client islands | page.tsx → Server Component, upload logic → UploadModal client component | ✅ Clean separation |
| C: New `/landing` route, redirect | Landing at different URL | ❌ Unnecessary complexity, breaks `/` being the app |

**Use Option B.** Replace `page.tsx` with a thin Server Component shell. Extract the upload state machine into a dedicated `UploadModal` client component. Landing sections remain largely static markup.

### New File Structure

```
frontend/
├── app/
│   └── page.tsx                           MODIFIED: Replace entirely (RSC shell)
│
└── components/
    ├── landing/                           NEW DIRECTORY
    │   ├── navbar.tsx                     NEW: Server Component (static nav)
    │   ├── hero-section.tsx               NEW: Server Component (static markup)
    │   ├── features-section.tsx           NEW: Server Component (static markup)
    │   ├── how-it-works-section.tsx       NEW: Server Component (static markup)
    │   ├── upload-modal.tsx               NEW: Client Component (full upload state machine)
    │   └── scroll-reveal.tsx              NEW: Client Component (IntersectionObserver wrapper)
    │
    ├── upload/                            UNCHANGED
    │   ├── upload-zone.tsx                ← Reused as-is inside upload-modal
    │   ├── document-preview.tsx           ← Reused as-is inside upload-modal
    │   └── processing-stages.tsx          ← Reused as-is inside upload-modal
    │
    └── ui/
        └── dialog.tsx                     NEW: shadcn/ui Dialog (add via CLI)
```

### Component Responsibility Map

| Component | Type | Responsibility | Communicates With |
|-----------|------|----------------|-------------------|
| `app/page.tsx` | Server Component | Layout shell, renders all landing sections | Renders LandingPage structure |
| `navbar.tsx` | Server Component | Logo, brand name, optional nav CTA | None (static) |
| `hero-section.tsx` | Server Component | Tagline, subheadline, CTA button area | Passes open handler from parent |
| `features-section.tsx` | Server Component | 3–4 feature cards, wrapped in ScrollReveal | None |
| `how-it-works-section.tsx` | Server Component | Step 1/2/3 flow, wrapped in ScrollReveal | None |
| `upload-modal.tsx` | **Client Component** | Full upload state machine, Dialog container | UploadZone, DocumentPreview, ProcessingStages, useUpload, useJobStream |
| `scroll-reveal.tsx` | **Client Component** | IntersectionObserver, adds animation classes | Used as wrapper by section components |

### Data Flow

```
page.tsx (Server Component)
  └── renders:
      ├── <Navbar />  (Server Component — static)
      │
      ├── <HeroWithModal />  (Client Component — minimal: just isOpen state)
      │   ├── <HeroSection onOpen={...} />     ← static hero markup + CTA button
      │   └── <UploadModal isOpen onClose />   ← full state machine lives here
      │       ├── <UploadZone onFileSelected />
      │       ├── <DocumentPreview onAnalyze />
      │       └── <ProcessingStages />
      │
      ├── <ScrollReveal>
      │   └── <FeaturesSection />   (Server Component — static)
      │
      └── <ScrollReveal>
          └── <HowItWorksSection />  (Server Component — static)
```

**Critical:** The CTA button in HeroSection needs to call `setIsOpen(true)`. Because buttons have onClick (client event), either:
- Extract just the CTA button as a tiny `"use client"` component inside hero-section, OR
- Wrap hero + modal in a single `HeroWithModal` client component island (recommended — simpler)

**Recommendation: `HeroWithModal` client island pattern** — One "use client" component owns `isOpen` state, renders both the static hero markup AND the modal. Static content (headings, subtext) lives inside it as JSX, not in a separate RSC. For a landing page this size, the RSC split for hero text offers negligible benefit over the cleaner composition.

---

## Integration Points

### 1. `app/page.tsx` — Replace Entirely

**Current:** Monolithic client component (183 lines), manages upload flow  
**New:** Server Component that renders landing layout

```typescript
// app/page.tsx  (Server Component — no "use client")
import { Navbar } from "@/components/landing/navbar";
import { HeroWithModal } from "@/components/landing/hero-with-modal";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { ScrollReveal } from "@/components/landing/scroll-reveal";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroWithModal />
      <ScrollReveal>
        <FeaturesSection />
      </ScrollReveal>
      <ScrollReveal delay={100}>
        <HowItWorksSection />
      </ScrollReveal>
    </main>
  );
}
```

**Breaking change:** The current upload flow in `page.tsx` moves to `UploadModal`. No functionality is lost — it's a direct code migration, not a rewrite.

### 2. `UploadModal` — Migration Target for Upload State Machine

Extract the current `page.tsx` logic verbatim into `upload-modal.tsx`. The upload hooks (`useUpload`, `useJobStream`) move with it:

```typescript
// components/landing/upload-modal.tsx
"use client";

// State from current page.tsx migrates here:
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [jobId, setJobId] = useState<string | null>(null);
const [completedJobId, setCompletedJobId] = useState<string | null>(null);
const [isNavigating, setIsNavigating] = useState(false);

// Hooks migrate here unchanged:
const uploadMutation = useUpload();
const { progress, isConnected, error: streamError } = useJobStream(jobId, { onComplete });

// Modal closes and resets on handleReset()
// On completedJobId → router.push to results (same as today)
```

**New prop:** `isOpen: boolean` and `onClose: () => void` — wired to the Dialog.  
**Preserved:** All state transitions, SSE reconnection logic, error/failed states, toast messages.

### 3. `UploadZone` — Zero Changes

Used inside `UploadModal` with the same props as today:
```typescript
<UploadZone onFileSelected={handleFileSelected} disabled={isUploading} />
```
No modifications to `upload-zone.tsx`.

### 4. `dialog.tsx` — New Dependency

The modal needs a Dialog primitive. Add it via shadcn CLI:
```bash
npx shadcn@latest add dialog
```
This installs `@radix-ui/react-dialog` and creates `components/ui/dialog.tsx`.

**Dialog sizing for upload modal:** The modal should be large enough to show the upload zone (600px width, 240px min-height per UploadZone's own constraints). Use `sm:max-w-[640px]` on `DialogContent`.

---

## Scroll Animations: Intersection Observer + tailwindcss-animate

### Decision: No Framer Motion

**Framer Motion is NOT in package.json.** Adding it would be ~45KB bundle increase for fade-in effects that `tailwindcss-animate` already provides natively. The existing codebase already uses `tailwindcss-animate` classes (`animate-in fade-in slide-in-from-bottom-2`).

**Use Intersection Observer + existing tailwindcss-animate.** This is zero additional dependencies and stays consistent with the existing pattern.

### `ScrollReveal` Component Pattern

```typescript
// components/landing/scroll-reveal.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // ms, for staggered sections
}

export function ScrollReveal({ children, className, delay = 0 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect(); } },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ animationDelay: `${delay}ms` }}
      className={cn(
        "transition-all duration-700",
        isVisible
          ? "animate-in fade-in slide-in-from-bottom-6 duration-700"
          : "opacity-0",
        className
      )}
    >
      {children}
    </div>
  );
}
```

**Why this works for SSR:**
- Server renders with `opacity-0` (no JS on server, `isVisible` starts `false`)
- After hydration, IntersectionObserver fires on client
- No hydration mismatch: initial state is identical server/client (`opacity-0`)
- `prefers-reduced-motion` already handled globally in `globals.css`

### SSR/Hydration Pitfall Prevention

| Pitfall | Cause | Prevention |
|---------|-------|------------|
| Hydration mismatch on animations | Server renders "visible", client renders "hidden" | Default `isVisible = false` — server and client agree on initial state |
| `window is not defined` | IntersectionObserver used outside `useEffect` | Always inside `useEffect` — only runs in browser |
| Layout shift on modal open | Dialog unmounted until open | Use `Dialog` with `open` prop — Radix keeps it in DOM with display:none |
| `prefers-reduced-motion` ignored by JS | Only CSS `@media` set | `globals.css` already handles this for all transitions/animations |
| Scroll position jumps on modal open | Body scroll not locked | Radix Dialog handles `body { overflow: hidden }` automatically |

---

## Build Order (Dependencies-First)

Ordered by dependency graph — each step unblocks the next:

```
1. [INFRA] Add shadcn Dialog component
   → npx shadcn@latest add dialog
   → Installs @radix-ui/react-dialog, creates components/ui/dialog.tsx
   → Required by: UploadModal

2. [COMPONENT] Create scroll-reveal.tsx
   → No dependencies (uses only React + Tailwind classes)
   → Required by: page.tsx sections

3. [COMPONENT] Create navbar.tsx
   → No dependencies (static markup, shadcn Button)
   → Can be built in parallel with step 2

4. [COMPONENT] Create upload-modal.tsx
   → Depends on: dialog.tsx (step 1), existing upload/* components, hooks
   → Migrate state machine from current page.tsx here
   → Test in isolation before wiring to hero

5. [COMPONENT] Create hero-with-modal.tsx (HeroWithModal)
   → Depends on: upload-modal.tsx (step 4)
   → Owns isOpen state, renders hero copy + CTA button + UploadModal
   → CTA button onClick → setIsOpen(true)

6. [COMPONENT] Create features-section.tsx
   → No dependencies (static markup)
   → Can be built in parallel with steps 3–5

7. [COMPONENT] Create how-it-works-section.tsx
   → No dependencies (static markup)
   → Can be built in parallel with steps 3–5

8. [INTEGRATION] Replace app/page.tsx
   → Depends on: all above components
   → Wire together: Navbar + HeroWithModal + ScrollReveal(Features) + ScrollReveal(HowItWorks)
   → Remove old upload-state-machine code (now in UploadModal)
   → Verify: upload flow still works end-to-end

9. [POLISH] Scroll animation tuning
   → Adjust delays, threshold, rootMargin for visual feel
   → Test reduced-motion preference
```

---

## Component Boundaries: New vs Modified vs Unchanged

### New Files (create from scratch)

| File | Type | Notes |
|------|------|-------|
| `components/landing/navbar.tsx` | Server Component | Logo + nav items |
| `components/landing/hero-with-modal.tsx` | Client Component | `isOpen` state + CTA + modal |
| `components/landing/upload-modal.tsx` | Client Component | State machine migrated from page.tsx |
| `components/landing/features-section.tsx` | Server Component | Static feature cards |
| `components/landing/how-it-works-section.tsx` | Server Component | Static step list |
| `components/landing/scroll-reveal.tsx` | Client Component | IntersectionObserver wrapper |
| `components/ui/dialog.tsx` | Client Component | shadcn/ui add dialog |

### Modified Files (surgical changes)

| File | Change | Risk |
|------|--------|------|
| `app/page.tsx` | Full replace — becomes RSC shell | LOW — existing logic moves to UploadModal, not deleted |
| `package.json` | Add `@radix-ui/react-dialog` (via shadcn CLI) | NONE |

### Unchanged Files (zero modifications needed)

| File | Why Unchanged |
|------|--------------|
| `components/upload/upload-zone.tsx` | Reused with same props inside UploadModal |
| `components/upload/document-preview.tsx` | Reused with same props inside UploadModal |
| `components/upload/processing-stages.tsx` | Reused with same props inside UploadModal |
| `hooks/use-upload.ts` | Called from UploadModal, no interface changes |
| `hooks/use-job-stream.ts` | Called from UploadModal, no interface changes |
| `app/layout.tsx` | No structural changes (Navbar is page-level, not root-level) |
| `app/results/[job_id]/page.tsx` | Results flow unchanged |
| `app/globals.css` | Already handles reduced-motion |
| `tailwind.config.ts` | No new tokens needed |

---

## Scalability Considerations

| Concern | Current Approach | Future Path |
|---------|-----------------|-------------|
| Modal state management | `useState` in HeroWithModal | Sufficient; only 1 modal on page |
| Animation library | IntersectionObserver + CSS | If complex animations needed later, add `framer-motion` |
| Landing page sections | Separate components per section | Easy to add/remove/reorder sections |
| Navbar stickiness | Initially static | Add `position: sticky` + backdrop blur if desired |
| Dark mode | CSS variables in globals.css support it | Toggle via `class` on `<html>` (darkMode: ["class"] already configured) |

---

## Sources

- Direct codebase inspection: `frontend/app/page.tsx`, `frontend/components/upload/upload-zone.tsx`, `frontend/package.json`, `frontend/tailwind.config.ts`, `frontend/app/globals.css`, `frontend/app/layout.tsx`
- Next.js 15 App Router documentation: RSC/Client Component composition patterns (HIGH confidence — verified against existing code behavior)
- Radix UI Dialog: `@radix-ui/react-dialog` (shadcn/ui standard pattern, HIGH confidence)
- `tailwindcss-animate`: animate-in/fade-in/slide-in classes confirmed present in existing codebase
