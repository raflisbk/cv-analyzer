import type { SuggestionCard } from "@/lib/types";

export interface WorkspaceFix {
  id: string;
  section: string;
  before: string;
  after: string;
  explanation: string;
  label: string;
  points: number;
}

export function flattenFixes(
  cards: SuggestionCard[] | null | undefined,
): WorkspaceFix[] {
  return (cards ?? []).flatMap((card) =>
    card.suggestions.map((item, index) => ({
      id: `${card.section}-${index}`,
      section: card.section,
      before: item.originalText ?? item.text,
      after: item.afterText ?? "",
      explanation: item.explanation ?? item.text,
      label:
        item.type === "impact_metric"
          ? "No number"
          : item.type === "action_verb"
            ? "Vague verb"
            : "Missing section",
      points: item.priority === "high_impact" ? 3 : 1,
    })),
  );
}

export function needsNumber(after: string): boolean {
  return /\[[^\]]*(?:how many|number|percent|amount|count|metric)[^\]]*\]/i.test(
    after,
  );
}

export function fillNumber(after: string, value: string): string | null {
  if (!/^\d+(?:[.,]\d+)?%?$/.test(value.trim())) {
    return null;
  }
  return after.replace(/\[[^\]]*\]/, value.trim());
}
