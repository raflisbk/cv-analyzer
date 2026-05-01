

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SSEConnection, SSEMessage } from "@/lib/sse";

interface ProgressUpdate {
  stage: string;
  percentage: number;
  message: string;
}

interface UseJobStreamOptions {
  onComplete?: (jobId: string) => void;
}

export function useJobStream(jobId: string | null, options?: UseJobStreamOptions) {
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const completedRef = useRef(false);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const startFallbackPoll = useCallback(
    (id: string, onComplete: (jobId: string) => void) => {
      if (completedRef.current) return;

      const checkStatus = async () => {
        if (completedRef.current) { stopPolling(); return; }
        try {
          const res = await fetch(`${apiUrl}/jobs/${id}/results`);
          if (!res.ok) return;
          const json = (await res.json()) as { data?: { status?: string } };
          const status = json.data?.status;
          if (status === "complete" || status === "failed") {
            completedRef.current = true;
            stopPolling();
            if (status === "complete") { onComplete(id); }
            setProgress({ stage: status, percentage: 100, message: status === "complete" ? "Analysis complete!" : "Analysis failed." });
          }
        } catch { /* ignore network errors during fallback poll */ }
      };

      void checkStatus();
      if (!pollIntervalRef.current) {
        pollIntervalRef.current = setInterval(() => { void checkStatus(); }, 4000);
      }
    },
    [apiUrl, stopPolling]
  );

  useEffect(() => {
    setProgress(null);
    setIsConnected(false);
    setError(null);
    completedRef.current = false;
    stopPolling();

    if (!jobId) return;

    const streamUrl = `${apiUrl}/stream/${jobId}`;

    let connection: SSEConnection;

    connection = new SSEConnection(
      streamUrl,
      (data: SSEMessage) => {
        if (data.type === "connected") {
          setIsConnected(true);
        } else if (data.stage && data.percentage !== undefined && data.message) {
          setProgress({
            stage: data.stage,
            percentage: data.percentage,
            message: data.message,
          });
          if (data.stage === "complete" && options?.onComplete && jobId) {
            completedRef.current = true;
            stopPolling();
            connection.close();
            options.onComplete(jobId);
          }
          if (data.stage === "failed") {
            completedRef.current = true;
            stopPolling();
            connection.close();
          }
        }
      },
      (err: Error) => {
        setError(err);
        setIsConnected(false);
        if (!completedRef.current && jobId && options?.onComplete) {
          startFallbackPoll(jobId, options.onComplete);
        }
      }
    );

    connection.connect();

    const safetyTimer = setTimeout(() => {
      if (!completedRef.current && jobId && options?.onComplete) {
        startFallbackPoll(jobId, options.onComplete);
      }
    }, 8000);

    return () => {
      connection.close();
      clearTimeout(safetyTimer);
      stopPolling();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  return { progress, isConnected, error };
}
