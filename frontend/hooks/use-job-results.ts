

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
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "complete" || status === "failed") return false;
      return 3000;
    },
    staleTime: 0,
    retry: 3,
    enabled: !!jobId,
  });
}
