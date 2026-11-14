import { getWorkspaceHydration as loadWorkspaceHydration } from "@/lib/workspace";
export { getJobFileUrl } from "@/lib/workspace";
import { apiFetch, getJobResults as loadJobResults } from "@/lib/api";
import { rawRequest } from "./raw-request";
import type { WorkspaceHydration } from "@/lib/workspace";
import type {
  AnalysisResult,
  SuggestionCard,
  SuggestionItem,
} from "@/lib/types";

type BackendSuggestion = SuggestionItem & {
  original_text?: string | null;
  after_text?: string | null;
  needsInput?: { token: string; question: string }[];
};
type BackendCard = Omit<SuggestionCard, "suggestions"> & {
  suggestions: BackendSuggestion[];
};

export function normalizeSuggestions(cards: BackendCard[] | null | undefined) {
  return (
    cards?.map((card) => ({
      ...card,
      suggestions: card.suggestions.map((item) => ({
        ...item,
        originalText: item.originalText ?? item.original_text ?? undefined,
        afterText: item.afterText ?? item.after_text ?? undefined,
        needsInput: item.needsInput ?? [],
      })),
    })) ?? null
  );
}

export async function getJobResults(jobId: string): Promise<AnalysisResult> {
  const result = await loadJobResults(jobId);
  return { ...result, suggestions: normalizeSuggestions(result.suggestions) };
}

export async function getWorkspaceHydration(
  jobId: string,
): Promise<WorkspaceHydration> {
  const result = await loadWorkspaceHydration(jobId);
  return {
    ...result,
    analysis: {
      ...result.analysis,
      suggestions: normalizeSuggestions(result.analysis.suggestions),
    },
  };
}

export async function getJobPdf(jobId: string): Promise<Blob> {
  const response = await rawRequest(
    `/api/v1/jobs/${encodeURIComponent(jobId)}/file/proxy`,
  );
  if (!response.ok) {
    throw new Error("Original file unavailable for this CV.");
  }
  const file = await response.blob();
  if (!file.size) {
    throw new Error("Original file unavailable for this CV.");
  }
  return file;
}

export async function requestInlineRewrite(
  jobId: string,
  selectedText: string,
  instruction: string,
): Promise<string> {
  const data = await apiFetch<{ rewrittenText: string }>(
    `/jobs/${jobId}/inline-edit`,
    {
      method: "POST",
      body: JSON.stringify({
        selectedText,
        prompt: instruction,
        cvContext: null,
      }),
    },
  );
  return data.rewrittenText;
}
