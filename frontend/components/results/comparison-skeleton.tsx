/**
 * ComparisonSkeleton — Shimmer loading skeleton during comparison SSE.
 * Per UI-SPEC §7.7. Mirrors MatchScoreCard, SkillsGapDisplay, MissingQualificationsList layout.
 * Used by CompareTab during pending/comparing states (UX-04).
 */

import { Skeleton } from "@/components/ui/skeleton";

export function ComparisonSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading comparison results…" role="status">
      {/* MatchScoreCard skeleton */}
      <div className="border border-border rounded-lg p-6">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-4 w-32 mt-1" />
        <div className="mt-4 space-y-2">
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-2 w-full" />
        </div>
      </div>

      {/* SkillsGapDisplay skeleton — three rows of pill clusters */}
      <div className="border border-border rounded-lg p-6">
        <Skeleton className="h-6 w-24 mb-4" />
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex flex-wrap gap-2 mb-4">
            {[0, 1, 2, 3].map((pill) => (
              <Skeleton key={pill} className="h-6 w-16 rounded-full" />
            ))}
          </div>
        ))}
      </div>

      {/* MissingQualificationsList skeleton — four rows */}
      <div className="border border-border rounded-lg p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        {[0, 1, 2, 3].map((row) => (
          <Skeleton key={row} className="h-5 w-full mb-2" />
        ))}
      </div>

      {/* Loading label per UI-SPEC §7.7 */}
      <p className="text-sm text-muted-foreground text-center mt-4">
        Comparing your CV against the job description…
      </p>
    </div>
  );
}
