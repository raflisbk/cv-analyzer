/**
 * React Query hook for polling GET /api/v1/jobs/{id}/results per D-21.
 * Polls every 3 seconds while status is processing, stops when complete/failed.
 */

"use client";

import { useQuery } from "@tanstack/react-query";

import { getJobResults } from "@/lib/api";
import type { AnalysisResult } from "@/lib/types";

export function useJobResults(jobId: string | null) {
  return useQuery<AnalysisResult, Error>({
    queryKey: ["job-results", jobId],
    queryFn: () => {
      if (!jobId) throw new Error("No jobId provided");
      return getJobResults(jobId);
    },
    // Stop polling when complete or failed per D-21
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "complete" || status === "failed") return false;
      return 3000; // Poll every 3 seconds while processing
    },
    staleTime: 0, // Always fresh while polling
    retry: 3, // Retry on network errors
    enabled: !!jobId,
  });
}
