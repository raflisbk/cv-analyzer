"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getWorkspaceHydration,
  type WorkspaceHydration,
} from "@/lib/workspace";

export function useWorkspaceHydration(jobId: string | null) {
  return useQuery<WorkspaceHydration, Error>({
    queryKey: ["workspace-hydration", jobId],
    queryFn: () => {
      if (!jobId) {
        throw new Error("No jobId provided");
      }

      return getWorkspaceHydration(jobId);
    },
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "ready" || status === "failed" ? false : 3000;
    },
    staleTime: 0,
    retry: 3,
    enabled: !!jobId,
  });
}
