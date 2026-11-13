import type { SuggestionCard, SuggestionItem } from "@/lib/types";

export interface FixInput {
  token: string;
  question: string;
}
type InputCard = Omit<SuggestionCard, "suggestions"> & {
  suggestions: (SuggestionItem & { needsInput?: FixInput[] })[];
};

export interface WorkspaceFix {
  id: string;
  section: string;
  before: string;
  after: string;
  explanation: string;
  label: string;
  points: number;
  needsInput?: FixInput[];
}

export function flattenFixes(
  cards: InputCard[] | null | undefined,
): WorkspaceFix[] {
  return (cards ?? []).flatMap((card, cardIndex) =>
    card.suggestions
      .map((item, index) => ({
        id: `${card.section}_${index}_${cardIndex}`,
        section: card.section,
        before: item.originalText ?? "",
        after: item.afterText ?? "",
        explanation: item.explanation ?? item.text,
        label:
          item.type === "impact_metric"
            ? "No number"
            : item.type === "action_verb"
              ? "Vague verb"
              : "Missing section",
        points: item.priority === "high_impact" ? 3 : 1,
        needsInput: item.needsInput ?? [],
      }))
      .filter((item) => Boolean(item.after)),
  );
}

export function fillInputs(
  after: string,
  inputs: FixInput[],
  answers: Record<string, string>,
): string | null {
  let filled = after;
  for (const { token } of inputs) {
    const value = answers[token]?.trim();
    if (!value || value.length > 80 || /[\x00-\x1f\x7f]/.test(value)) {
      return null;
    }
    filled = filled.replaceAll(token, value);
  }
  return filled;
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
