/**
 * SSE job progress streaming hook
 * Implements D-13: Real-time progress updates via SSE
 * Implements D-15: Auto-reconnect with resume from last stage
 * Implements D-21 fallback: poll REST API when SSE fails to receive complete
 */

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

  /** Fallback: poll REST endpoint every 4s to detect completion when SSE drops */
  const startFallbackPoll = useCallback(
    (id: string, onComplete: (jobId: string) => void) => {
      if (pollIntervalRef.current || completedRef.current) return;

      pollIntervalRef.current = setInterval(() => {
        void (async () => {
          if (completedRef.current) { stopPolling(); return; }
          try {
            const res = await fetch(`${apiUrl}/jobs/${id}/results`);
            if (!res.ok) return;
            const json = (await res.json()) as { data?: { status?: string } };
            const status = json.data?.status;
            if (status === "complete" || status === "failed") {
              completedRef.current = true;
              stopPolling();
              if (status === "complete") onComplete(id);
              // Synthesise a progress update so the UI reflects final state
              setProgress({ stage: status, percentage: 100, message: status === "complete" ? "Analysis complete!" : "Analysis failed." });
            }
          } catch { /* ignore network errors during fallback poll */ }
        })();
      }, 4000);
    },
    [apiUrl, stopPolling]
  );

  useEffect(() => {
    // Reset state on job change
    setProgress(null);
    setIsConnected(false);
    setError(null);
    completedRef.current = false;
    stopPolling();

    if (!jobId) return;

    const streamUrl = `${apiUrl}/stream/${jobId}`;

    const connection = new SSEConnection(
      streamUrl,
      (data: SSEMessage) => {
        if (data.type === "connected") {
          setIsConnected(true);
          stopPolling(); // SSE is live — no need for fallback poll
        } else if (data.stage && data.percentage !== undefined && data.message) {
          setProgress({
            stage: data.stage,
            percentage: data.percentage,
            message: data.message,
          });
          if (data.stage === "complete" && options?.onComplete && jobId) {
            completedRef.current = true;
            stopPolling();
            options.onComplete(jobId);
          }
        }
      },
      (err: Error) => {
        setError(err);
        setIsConnected(false);
        // SSE exhausted all retries — fall back to REST polling
        if (!completedRef.current && jobId && options?.onComplete) {
          startFallbackPoll(jobId, options.onComplete);
        }
      }
    );

    connection.connect();

    // Also start a fallback poll after 15s in case SSE never fires complete
    const safetyTimer = setTimeout(() => {
      if (!completedRef.current && jobId && options?.onComplete) {
        startFallbackPoll(jobId, options.onComplete);
      }
    }, 15000);

    return () => {
      connection.close();
      clearTimeout(safetyTimer);
      stopPolling();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  return { progress, isConnected, error };
}
