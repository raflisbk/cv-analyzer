/**
 * SuggestionCards — orchestrator component for AI improvement suggestions.
 * Handles all render states: loading skeleton, unavailable, empty, populated.
 * Per UI-SPEC Phase 3 §6 sections A, D, E and §5 copywriting contract.
 */
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { SuggestionCard } from "@/lib/types";
import { SuggestionCardItem } from "./suggestion-card";

// ─── Internal: Skeleton loading state (UI-SPEC §6 section D) ──────────────────

function SuggestionsSkeleton() {
  return (
    <div className="mt-8 space-y-4" aria-hidden="true">
      {/* Heading skeleton */}
      <Skeleton className="h-7 w-56" />

      {/* Card 1 skeleton */}
      <div className="border border-border rounded-lg p-4 space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Skeleton className="h-4 w-4 mt-0.5 shrink-0" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-5 w-20 shrink-0" />
          </div>
          <div className="flex items-start gap-2">
            <Skeleton className="h-4 w-4 mt-0.5 shrink-0" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-5 w-20 shrink-0" />
          </div>
          <div className="flex items-start gap-2">
            <Skeleton className="h-4 w-4 mt-0.5 shrink-0" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-16 shrink-0" />
          </div>
        </div>
      </div>

      {/* Card 2 skeleton — same structure */}
      <div className="border border-border rounded-lg p-4 space-y-3">
        <Skeleton className="h-5 w-32" />
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <Skeleton className="h-4 w-4 mt-0.5 shrink-0" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-5 w-20 shrink-0" />
          </div>
          <div className="flex items-start gap-2">
            <Skeleton className="h-4 w-4 mt-0.5 shrink-0" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-5 w-20 shrink-0" />
          </div>
          <div className="flex items-start gap-2">
            <Skeleton className="h-4 w-4 mt-0.5 shrink-0" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-16 shrink-0" />
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground text-center mt-2">
        Generating AI suggestions…
      </p>
    </div>
  );
}

// ─── Internal: Empty / unavailable state (UI-SPEC §6 section E) ───────────────

interface SuggestionsEmptyProps {
  variant: "empty" | "unavailable";
}

function SuggestionsEmpty({ variant }: SuggestionsEmptyProps) {
  const heading =
    variant === "empty" ? "No suggestions available" : "AI suggestions unavailable";
  const body =
    variant === "empty"
      ? "Your CV looks strong — no specific improvement suggestions were identified."
      : "The AI analysis could not complete at this time. Your scores and other results are unaffected.";

  return (
    <div className="mt-8 text-center py-8 space-y-2">
      <p className="text-base font-semibold text-foreground">{heading}</p>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">{body}</p>
    </div>
  );
}

// ─── Public: SuggestionCards orchestrator (UI-SPEC §6 section A) ──────────────

interface SuggestionCardsProps {
  cards: SuggestionCard[] | null | undefined;
  isLoading: boolean;
}

export function SuggestionCards({ cards, isLoading }: SuggestionCardsProps) {
  // Loading: LLM task is in progress — show skeleton
  if (isLoading) {
    return <SuggestionsSkeleton />;
  }

  // Undefined: suggestions field absent (pre-Phase 3 job) — render nothing
  if (cards === undefined) {
    return null;
  }

  // Null: LLM failed all retries (ERROR-02, D-17) — show "unavailable" state
  if (cards === null) {
    return <SuggestionsEmpty variant="unavailable" />;
  }

  // Empty array: LLM succeeded but found nothing to suggest
  if (cards.length === 0) {
    return <SuggestionsEmpty variant="empty" />;
  }

  // Populated: render suggestion cards with heading + count summary
  const totalSuggestions = cards.reduce((sum, card) => sum + card.suggestions.length, 0);
  const totalSections = cards.length;
  const suggestionText = totalSuggestions === 1 ? "suggestion" : "suggestions";
  const sectionText = totalSections === 1 ? "section" : "sections";

  return (
    <section aria-label="AI Improvement Suggestions" className="mt-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">AI Improvement Suggestions</h2>
        <p className="text-sm text-muted-foreground">
          {totalSuggestions} {suggestionText} across {totalSections} {sectionText}
        </p>
      </div>
      <div className="space-y-4">
        {cards.map((card) => (
          <SuggestionCardItem key={card.section} card={card} />
        ))}
      </div>
    </section>
  );
}
