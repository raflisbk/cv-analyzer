/**
 * Results page for /results/[job_id] per D-20, D-21.
 * Polls GET /api/v1/jobs/{id}/results until complete/failed.
 * Shows skeleton while processing, error state on failure.
 */

"use client";

import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useJobResults } from "@/hooks/use-job-results";
import { Button } from "@/components/ui/button";
import { ResultsError } from "@/components/results/results-error";
import { ResultsSkeleton } from "@/components/results/results-skeleton";
import { ResultsTabs } from "@/components/results/results-tabs";
import { ScoreRangeBadge } from "@/components/results/score-range-badge";

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.job_id as string;

  const { data, isLoading, isError, error } = useJobResults(jobId);

  // Error state — network error or API error per UI-SPEC §5 "Error states"
  if (isError) {
    const isRateLimit =
      (error as Error)?.message?.includes("429") ||
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error as any)?.code === "RATE_LIMIT_EXCEEDED";
    return (
      <main className="min-h-screen bg-background py-12 px-4">
        <ResultsError type={isRateLimit ? "rate-limit" : "network"} />
      </main>
    );
  }

  // Not found
  if (!isLoading && data === undefined) {
    return (
      <main className="min-h-screen bg-background py-12 px-4">
        <ResultsError type="not-found" />
      </main>
    );
  }

  // Failed analysis
  if (data?.status === "failed") {
    return (
      <main className="min-h-screen bg-background py-12 px-4">
        <ResultsError type="failed" />
      </main>
    );
  }

  const isProcessing = !data || data.status !== "complete";

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Page header per UI-SPEC §7 B */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-semibold text-foreground">
            CV Analysis Results
          </h1>
          {/* Polling indicator per UI-SPEC §8 */}
          {isProcessing && (
            <div
              className="flex items-center gap-2 text-sm text-muted-foreground"
              aria-live="polite"
              aria-busy="true"
            >
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking for results…
            </div>
          )}
        </div>

        {/* Loading/Processing state per UI-SPEC §7 B */}
        {isProcessing ? (
          <div className="space-y-4">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-xl font-semibold text-foreground">
                Analyzing your CV…
              </h2>
              <p className="text-base text-muted-foreground">
                This usually takes 15–30 seconds.
              </p>
            </div>
            <ResultsSkeleton />
          </div>
        ) : (
          /* Complete state per UI-SPEC §7 C */
          <div className="space-y-8">
            {/* Overall score hero per UI-SPEC §7 C */}
            {data.scores && (
              <div className="flex flex-col items-center py-8 gap-2">
                <span
                  className="text-5xl font-bold"
                  style={{
                    color:
                      data.scores.overall >= 80
                        ? "#16a34a"
                        : data.scores.overall >= 60
                          ? "#d97706"
                          : "#dc2626",
                  }}
                >
                  {data.scores.overall}
                </span>
                <p className="text-sm text-muted-foreground mt-1">
                  Overall Score
                </p>
                <ScoreRangeBadge score={data.scores.overall} />
              </div>
            )}

            {/* Tabs: Overview | Scores | Skills | Grammar per D-20 */}
            <ResultsTabs result={data} />

            {/* Analyze Another CV button per UI-SPEC §5 */}
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={() => router.push("/")}>
                Analyze Another CV
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
