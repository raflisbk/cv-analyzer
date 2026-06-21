"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useJobResults } from "@/hooks/use-job-results";
import type { JobRole, ScoreVersion, SuggestionCard } from "@/lib/types";
import { apiFetch } from "@/lib/api";
import { ExportStickyBar } from "@/components/results/export-sticky-bar";
import { ResultsError } from "@/components/results/results-error";
import { ResultsSkeleton } from "@/components/results/results-skeleton";
import { ResultsTabs } from "@/components/results/results-tabs";
import { ScoreRangeBadge } from "@/components/results/score-range-badge";
import { normalizeAnalysisResult } from "@/lib/normalize-analysis-result";
import { getWorkspaceRoute } from "@/lib/job-routes";

function VersionHistoryBar({ versions, currentJobId }: { versions: ScoreVersion[]; currentJobId: string }) {
  if (!versions || versions.length < 2) { return null; }
  return (
    <div className="rounded-2xl border border-white/8 bg-[#1C1C1C] px-6 py-4">
      <p className="text-xs font-extrabold uppercase tracking-widest text-[#F5F2D8]/40 mb-3">Version History</p>
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {versions.map((v, i) => {
          const isCurrent = v.job_id === currentJobId;
          const deltaColor = v.delta === null ? "" : v.delta > 0 ? "text-[#CAFF43]" : v.delta < 0 ? "text-[#FF4FCB]" : "text-[#F5F2D8]/40";
          return (
            <div key={v.job_id} className="flex items-center gap-2 flex-shrink-0">
              {i > 0 && <span className="text-[#F5F2D8]/20 text-sm">→</span>}
              <a
                href={`/results/${v.job_id}`}
                className={`rounded-xl px-3 py-2 text-center transition-colors ${
                  isCurrent
                    ? "bg-[#CAFF43]/10 border border-[#CAFF43]/30"
                    : "bg-white/4 border border-white/8 hover:bg-white/8"
                }`}
              >
                <p className={`text-xs font-extrabold ${isCurrent ? "text-[#CAFF43]" : "text-[#F5F2D8]/60"}`}>
                  v{v.version}
                </p>
                <p className={`text-sm font-extrabold ${isCurrent ? "text-[#CAFF43]" : "text-[#F5F2D8]"}`}>
                  {v.overall}
                </p>
                {v.delta !== null && (
                  <p className={`text-[10px] font-bold ${deltaColor}`}>
                    {v.delta > 0 ? "+" : ""}{v.delta}
                  </p>
                )}
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function buildSuggestionsClipboardText(
  cards: SuggestionCard[] | null | undefined
): string | undefined {
  if (!cards || cards.length === 0) {
    return undefined;
  }

  const hasAnySuggestions = cards.some((card) => card.suggestions.length > 0);
  if (!hasAnySuggestions) {
    return undefined;
  }

  const cardsWithSuggestions = cards.filter((card) => card.suggestions.length > 0);
  const sections = cardsWithSuggestions
    .map((card) => {
      const suggestionsText = card.suggestions
        .map((suggestion, index) => `${index + 1}. ${suggestion.text}`)
        .join("\n");

      return `${card.section}\n${suggestionsText}`;
    })
    .join("\n\n");

  if (process.env.NODE_ENV !== "production") {
    const renderedCount = cardsWithSuggestions.reduce(
      (sum, card) => sum + card.suggestions.length,
      0
    );
    const copiedCount = sections
      .split("\n")
      .filter((line) => /^\d+\.\s/.test(line))
      .length;
    if (copiedCount !== renderedCount) {
      console.warn("Copy payload suggestion count mismatch detected");
    }
  }

  return `AI Improvement Suggestions\n\n${sections}`;
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.job_id as string;

  const { data, isLoading, isError, error, refetch } = useJobResults(jobId);
  const normalizedResult = data ? normalizeAnalysisResult(data) : null;
  const suggestionsClipboardText = buildSuggestionsClipboardText(normalizedResult?.suggestions);

  const { data: jobRolesData } = useQuery<JobRole[]>({
    queryKey: ["job-roles"],
    queryFn: () => apiFetch<JobRole[]>("/job-roles"),
    staleTime: Infinity,
  });

  if (isError) {
    const isRateLimit =
      (error instanceof Error && error.message.includes("429")) ||
      (error instanceof Error && "code" in error && (error as Error & { code: string }).code === "RATE_LIMIT_EXCEEDED");
    return (
      <main className="min-h-screen bg-[#F5F2D8] py-12 px-4">
        <ResultsError type={isRateLimit ? "rate-limit" : "network"} />
      </main>
    );
  }

  if (!isLoading && data === undefined) {
    return (
      <main className="min-h-screen bg-[#F5F2D8] py-12 px-4">
        <ResultsError type="not-found" />
      </main>
    );
  }

  if (normalizedResult?.status === "failed") {
    return (
      <main className="min-h-screen bg-[#F5F2D8] py-12 px-4">
        <ResultsError type="failed" />
      </main>
    );
  }

  const isProcessing = !normalizedResult || normalizedResult.status !== "complete";
  const isComplete = normalizedResult?.status === "complete";

  const scoreColor = normalizedResult?.scores
    ? normalizedResult.scores.overall >= 80
      ? "#CAFF43"
      : normalizedResult.scores.overall >= 60
        ? "#FF8C42"
        : "#FF4FCB"
    : "#CAFF43";

  return (
    <>
      <main className={`min-h-screen bg-[#F5F2D8]${isComplete ? " pb-16" : ""}`}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#141414]/50 hover:text-[#141414] transition-colors mb-6 group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                Back to home
              </Link>
              <h1 className="font-display font-extrabold text-2xl md:text-3xl text-[#141414]">
                CV Analysis Results
              </h1>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <Link
                href={getWorkspaceRoute(jobId)}
                className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-bold text-[#141414] transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
                style={{
                  background: "rgba(17,17,17,0.06)",
                  border: "1px solid rgba(17,17,17,0.10)",
                }}
              >
                Open workspace
              </Link>
              {isProcessing && (
                <div
                  className="flex items-center gap-2 text-sm text-[#141414]/50"
                  aria-live="polite"
                  aria-busy="true"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking for results…
                </div>
              )}
            </div>
          </div>

          {isProcessing ? (
            <div className="space-y-4">
              <div className="bg-[#141414] rounded-[2rem] p-10 text-center space-y-4 border border-[#CAFF43]/10 animate-pulse">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-[#CAFF43] rounded-full animate-ping" />
                  <div className="w-2 h-2 bg-[#FF8C42] rounded-full animate-ping [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-[#FF4FCB] rounded-full animate-ping [animation-delay:0.4s]" />
                </div>
                <h2 className="font-display font-extrabold text-xl text-[#F5F2D8]">
                  Analyzing your CV…
                </h2>
                <p className="text-sm text-[#F5F2D8]/50">
                  This usually takes 15–30 seconds.
                </p>
              </div>
              <ResultsSkeleton />
            </div>
          ) : (
            <div className="space-y-8">
              {normalizedResult.scores && (
                <div className="bg-[#141414] rounded-[2rem] px-8 py-10 flex flex-col items-center gap-2">
                  <span
                    className="font-display font-extrabold text-6xl"
                    style={{ color: scoreColor }}
                  >
                    {normalizedResult.scores.overall}
                  </span>
                  <p className="text-sm text-[#F5F2D8]/50 mt-1">Overall Score</p>
                  <ScoreRangeBadge score={normalizedResult.scores.overall} />
                </div>
              )}

              {normalizedResult.version_history && normalizedResult.version_history.length >= 2 && (
                <VersionHistoryBar
                  versions={normalizedResult.version_history}
                  currentJobId={jobId}
                />
              )}

                <ResultsTabs
                  result={normalizedResult}
                  jobRoles={jobRolesData ?? []}
                  onCompareComplete={() => { void refetch(); }}
                />

              <div className="flex items-center justify-center gap-3 pt-4 flex-wrap">
                <button
                  onClick={() => router.push("/")}
                  className="rounded-full border-2 border-[#141414] bg-transparent text-[#141414]
                             px-6 py-3 text-sm font-extrabold
                             hover:bg-[#141414] hover:text-[#F5F2D8] transition-colors duration-150"
                >
                  Analyze Another CV
                </button>
                <a
                  href={`/?reanalyze=${jobId}`}
                  className="rounded-full bg-[#141414]/8 border border-[#141414]/15 text-[#141414]
                             px-6 py-3 text-sm font-extrabold
                             hover:bg-[#141414]/15 transition-colors duration-150"
                >
                  Re-analyze (new version)
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
      {normalizedResult && (
        <ExportStickyBar
          jobId={jobId}
          analysisStatus={normalizedResult.status}
          suggestionsClipboardText={suggestionsClipboardText}
        />
      )}
    </>
  );
}
