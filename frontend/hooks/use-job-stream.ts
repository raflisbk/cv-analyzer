"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SSEConnection, SSEMessage } from "@/lib/sse";
import { resolveStep } from "@/lib/upload/stage";
import { useT } from "@/components/i18n/i18n-provider";

const POLL_INTERVAL_MS = 3000;

interface ProgressUpdate {
  stage: string;
  percentage: number;
  message: string;
  step: number;
  done?: number;
  total?: number;
}

interface UseJobStreamOptions {
  onComplete?: (jobId: string) => void;
}

export function useJobStream(
  jobId: string | null,
  options?: UseJobStreamOptions,
) {
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { t } = useT();
  const tRef = useRef(t);
  tRef.current = t;
  const completedRef = useRef(false);
  const stepRef = useRef(0);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(options?.onComplete);
  onCompleteRef.current = options?.onComplete;

  const apiUrl = "/api/v1";

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
        if (completedRef.current) {
          stopPolling();
          return;
        }
        try {
          const res = await fetch(`${apiUrl}/jobs/${id}`, {
            credentials: "include",
          });
          if (!res.ok) return;
          const json = (await res.json()) as { data?: { status?: string } };
          const status = json.data?.status;
          if (status === "complete" || status === "failed") {
            completedRef.current = true;
            stopPolling();
            if (status === "complete") {
              onComplete(id);
            }
            stepRef.current = status === "complete" ? 5 : stepRef.current;
            setProgress({
              stage: status,
              percentage: 100,
              step: stepRef.current,
              message:
                status === "complete"
                  ? tRef.current("errors.stream.complete")
                  : tRef.current("errors.stream.failed"),
            });
          }
        } catch {
          /* ignore network errors during fallback poll */
        }
      };

      void checkStatus();
      if (!pollIntervalRef.current) {
        pollIntervalRef.current = setInterval(() => {
          void checkStatus();
        }, POLL_INTERVAL_MS);
      }
    },
    [apiUrl, stopPolling],
  );

  useEffect(() => {
    setProgress(null);
    setIsConnected(false);
    setError(null);
    completedRef.current = false;
    stepRef.current = 0;
    stopPolling();

    if (!jobId) return;

    const streamUrl = `${apiUrl}/stream/${jobId}`;

    let connection: SSEConnection;

    connection = new SSEConnection(
      streamUrl,
      (data: SSEMessage) => {
        if (data.type === "connected") {
          setIsConnected(true);
        } else if (
          data.stage &&
          data.percentage !== undefined &&
          data.message
        ) {
          stepRef.current = resolveStep(data.stage, data.step, stepRef.current);
          setProgress({
            stage: data.stage,
            percentage: data.percentage,
            message: data.message,
            step: stepRef.current,
            done: data.done,
            total: data.total,
          });
          if (data.stage === "complete" && onCompleteRef.current && jobId) {
            completedRef.current = true;
            stopPolling();
            connection.close();
            onCompleteRef.current(jobId);
          }
          if (data.stage === "failed") {
            completedRef.current = true;
            stopPolling();
            connection.close();
          }
        }
      },
      () => {
        setIsConnected(false);
        if (!completedRef.current && jobId && onCompleteRef.current) {
          startFallbackPoll(jobId, onCompleteRef.current);
        }
      },
    );

    connection.connect();

    const safetyTimer = setTimeout(() => {
      if (!completedRef.current && jobId && onCompleteRef.current) {
        startFallbackPoll(jobId, onCompleteRef.current);
      }
    }, 60000);

    return () => {
      connection.close();
      clearTimeout(safetyTimer);
      stopPolling();
    };
  }, [jobId, apiUrl, stopPolling, startFallbackPoll]);

  return { progress, isConnected, error };
}
