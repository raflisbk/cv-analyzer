/**
 * Results page for /results/[job_id] per D-20, D-21, VIS-03.
 * Polls GET /api/v1/jobs/{id}/results until complete/failed.
 * Mathical design system: cream bg, dark score overview card, lime/orange/pink scoreColor.
 */

"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useJobResults } from "@/hooks/use-job-results";
import type { JobRole, SuggestionCard } from "@/lib/types";
import { ExportStickyBar } from "@/components/results/export-sticky-bar";
import { ResultsError } from "@/components/results/results-error";
import { ResultsSkeleton } from "@/components/results/results-skeleton";
import { ResultsTabs } from "@/components/results/results-tabs";
import { ScoreRangeBadge } from "@/components/results/score-range-badge";
import { normalizeAnalysisResult } from "@/lib/normalize-analysis-result";
import { getWorkspaceRoute } from "@/lib/job-routes";

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

  // Regression guard: always build clipboard text from the full rendered suggestions list.
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

  // Fetch job roles for Compare tab dropdown per D-C5, COMPARE-02
  const { data: jobRolesData } = useQuery<JobRole[]>({
    queryKey: ["job-roles"],
    queryFn: async () => {
      const res = await fetch("/api/v1/job-roles");
      const json = await res.json();
      return json.data as JobRole[];
    },
    staleTime: Infinity, // Job roles don't change
  });

  // Error state — network error or API error per UI-SPEC §5 "Error states"
  if (isError) {
    const isRateLimit =
      (error as Error)?.message?.includes("429") ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error as any)?.code === "RATE_LIMIT_EXCEEDED";
    return (
      <main className="min-h-screen bg-[#F5F2D8] py-12 px-4">
        <ResultsError type={isRateLimit ? "rate-limit" : "network"} />
      </main>
    );
  }

  // Not found
  if (!isLoading && data === undefined) {
    return (
      <main className="min-h-screen bg-[#F5F2D8] py-12 px-4">
        <ResultsError type="not-found" />
      </main>
    );
  }

  // Failed analysis
  if (normalizedResult?.status === "failed") {
    return (
      <main className="min-h-screen bg-[#F5F2D8] py-12 px-4">
        <ResultsError type="failed" />
      </main>
    );
  }

  const isProcessing = !normalizedResult || normalizedResult.status !== "complete";
  const isComplete = normalizedResult?.status === "complete";

  // Mathical score colors: lime (high >=80), orange (medium 60-79), pink (low <60) per VIS-03, D-02
  const scoreColor = normalizedResult?.scores
    ? normalizedResult.scores.overall >= 80
      ? "#CAFF43"   // lime — High
      : normalizedResult.scores.overall >= 60
        ? "#FF8C42" // orange — Medium
        : "#FF4FCB" // pink — Low
    : "#CAFF43";

  return (
    <>
      <main className={`min-h-screen bg-[#F5F2D8]${isComplete ? " pb-16" : ""}`}>
        <div className="max-w-4xl mx-auto px-4 py-12">
          {/* Page header per UI-SPEC §7 B */}
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
                className="inline-flex items-center justify-center rounded-full border border-[#141414]/15 bg-white/60 px-4 py-2 text-sm font-bold text-[#141414] transition-colors hover:bg-[#141414] hover:text-[#F5F2D8]"
              >
                Open workspace
              </Link>
              {/* Polling indicator per UI-SPEC §8 */}
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

          {/* Loading/Processing state per UI-SPEC §7 B */}
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
            /* Complete state per UI-SPEC §7 C */
            <div className="space-y-8">
              {/* Score overview dark card per VIS-03, D-03 */}
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

              {/* Tabs: Overview | Scores | Skills | Grammar | Compare per D-20, Phase 4 */}
                <ResultsTabs
                  result={normalizedResult}
                  jobRoles={jobRolesData ?? []}
                  onCompareComplete={() => { void refetch(); }}
                />

              {/* Analyze Another CV button per UI-SPEC §5 */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => router.push("/")}
                  className="rounded-full border-2 border-[#141414] bg-transparent text-[#141414]
                             px-6 py-3 text-sm font-extrabold
                             hover:bg-[#141414] hover:text-[#F5F2D8] transition-colors duration-150"
                >
                  Analyze Another CV
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      {/* ExportStickyBar — slides up when analysis complete per UI-SPEC §7.5, D-C12 */}
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
