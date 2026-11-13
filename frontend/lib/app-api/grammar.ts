import { apiFetch } from "@/lib/api";
import { USE_APP_MOCKS } from "./mode";
import { grammarFixture } from "./fixtures/grammar";
import type { GrammarData } from "./grammar.types";

export function getGrammar(jobId: string): Promise<GrammarData> {
  return USE_APP_MOCKS
    ? Promise.resolve(grammarFixture)
    : apiFetch(`/jobs/${encodeURIComponent(jobId)}/grammar`);
}

export function resolveGrammar(
  jobId: string,
  noteId: string,
  action: "accept" | "ignore",
): Promise<GrammarData> {
  return USE_APP_MOCKS
    ? Promise.resolve(grammarFixture)
    : apiFetch<GrammarData>(
        `/jobs/${encodeURIComponent(jobId)}/grammar/${encodeURIComponent(noteId)}/${action}`,
        {
          method: "POST",
        },
      );
}
