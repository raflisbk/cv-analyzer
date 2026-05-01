import type {
  AnalysisResult,
  ApiSuggestionCard,
  ApiSuggestionItem,
  SuggestionCard,
  SuggestionItem,
} from "@/lib/types";

function normalizeSuggestionItem(item: ApiSuggestionItem): SuggestionItem {
  return {
    ...item,
    originalText: item.originalText ?? item.original_text,
    afterText: item.afterText ?? item.after_text,
  };
}

function normalizeSuggestionCard(card: ApiSuggestionCard): SuggestionCard {
  return {
    section: card.section,
    suggestions: card.suggestions.map(normalizeSuggestionItem),
  };
}

export function normalizeAnalysisResult(result: AnalysisResult): AnalysisResult {
  if (result.suggestions === undefined || result.suggestions === null) {
    return result;
  }

  const rawCards = result.suggestions as unknown as ApiSuggestionCard[];

  return {
    ...result,
    suggestions: rawCards.map(normalizeSuggestionCard),
  };
}
