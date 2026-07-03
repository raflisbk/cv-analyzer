
"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getJobResults } from "@/lib/api";
import { SSEConnection } from "@/lib/sse";
import type { AnalysisResult } from "@/lib/types";

const TERMINAL_STATUSES = new Set(["complete", "failed"]);

export function useJobResults(jobId: string | null) {
  const queryClient = useQueryClient();
  const sseRef = useRef<SSEConnection | null>(null);

  const query = useQuery<AnalysisResult, Error>({
    queryKey: ["job-results", jobId],
    queryFn: () => {
      if (!jobId) throw new Error("No jobId provided");
      return getJobResults(jobId);
    },
    staleTime: 0,
    retry: 3,
    enabled: !!jobId,
  });

  const isTerminal = TERMINAL_STATUSES.has(query.data?.status ?? "");

  useEffect(() => {
    if (!jobId || isTerminal) {
      sseRef.current?.close();
      sseRef.current = null;
      return;
    }

    const connection = new SSEConnection(
      `/api/v1/stream/${jobId}`,
      (data) => {
        if (data.stage === "complete" || data.stage === "failed") {
          void queryClient.invalidateQueries({
            queryKey: ["job-results", jobId],
          });
        }
      },
      () => {
        // SSE failed — refetch once as fallback
        void queryClient.invalidateQueries({
          queryKey: ["job-results", jobId],
        });
      }
    );

    sseRef.current = connection;
    connection.connect();

    return () => {
      connection.close();
      sseRef.current = null;
    };
  }, [jobId, isTerminal, queryClient]);

  return query;
}
