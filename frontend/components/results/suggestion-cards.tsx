
"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { SuggestionCard } from "@/lib/types";
import { SuggestionCardItem } from "./suggestion-card";

function SuggestionsSkeleton() {
  return (
    <div className="mt-8 space-y-4" aria-hidden="true">
      <Skeleton className="h-7 w-56" />

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

interface SuggestionCardsProps {
  cards: SuggestionCard[] | null | undefined;
  isLoading: boolean;
}

export function SuggestionCards({ cards, isLoading }: SuggestionCardsProps) {
  if (isLoading) {
    return <SuggestionsSkeleton />;
  }

  if (cards === undefined) {
    return null;
  }

  if (cards === null) {
    return <SuggestionsEmpty variant="unavailable" />;
  }

  if (cards.length === 0) {
    return <SuggestionsEmpty variant="empty" />;
  }

  const totalSuggestions = cards.reduce((sum, card) => sum + card.suggestions.length, 0);
  const totalSections = cards.length;
  const suggestionText = totalSuggestions === 1 ? "suggestion" : "suggestions";
  const sectionText = totalSections === 1 ? "section" : "sections";

  return (
    <section aria-label="AI Improvement Suggestions" className="mt-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display font-extrabold text-lg text-[#141414]">AI Improvement Suggestions</h2>
        <p className="text-xs font-bold text-[#141414]/40 uppercase tracking-wider">
          {totalSuggestions} {suggestionText} · {totalSections} {sectionText}
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
