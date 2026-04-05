/**
 * SSE job progress streaming hook
 * Implements D-13: Real-time progress updates via SSE
 * Implements D-15: Auto-reconnect with resume from last stage
 */

"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    // Always reset state whenever jobId changes — prevents stale progress
    // from a previous job leaking into a new job or the upload zone.
    setProgress(null);
    setIsConnected(false);
    setError(null);

    if (!jobId) return;

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    const streamUrl = `${apiUrl}/stream/${jobId}`;

    const connection = new SSEConnection(
      streamUrl,
      (data: SSEMessage) => {
        if (data.type === "connected") {
          setIsConnected(true);
        } else if (
          data.stage &&
          data.percentage !== undefined &&
          data.message
        ) {
          setProgress({
            stage: data.stage,
            percentage: data.percentage,
            message: data.message,
          });
          // Trigger onComplete callback per D-19
          if (data.stage === "complete" && options?.onComplete && jobId) {
            options.onComplete(jobId);
          }
        }
      },
      (err: Error) => {
        setError(err);
        setIsConnected(false);
      }
    );

    connection.connect();

    return () => {
      connection.close();
    };
  }, [jobId]);

  return { progress, isConnected, error };
}
