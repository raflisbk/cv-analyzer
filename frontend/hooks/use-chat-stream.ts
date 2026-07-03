"use client";

import { useCallback, useRef, useState } from "react";

interface ChatStreamOptions {
  apiUrl: string;
  onToken?: (token: string) => void;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export function useChatStream(jobId: string | undefined, options: ChatStreamOptions) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const onTokenRef = useRef(options.onToken);
  onTokenRef.current = options.onToken;
  const onCompleteRef = useRef(options.onComplete);
  onCompleteRef.current = options.onComplete;
  const onErrorRef = useRef(options.onError);
  onErrorRef.current = options.onError;
  const apiUrlRef = useRef(options.apiUrl);
  apiUrlRef.current = options.apiUrl;

  const send = useCallback(
    async (message: string) => {
      if (!jobId || isStreaming) return;

      setIsStreaming(true);
      setError(null);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(`${apiUrlRef.current}/jobs/${jobId}/chat`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`Chat failed: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));

                if (data.type === "connected") {
                } else if (data.token) {
                  onTokenRef.current?.(data.token);
                } else if (data.type === "complete") {
                  onCompleteRef.current?.();
                  setIsStreaming(false);
                } else if (data.error) {
                  throw new Error(data.error);
                }
              } catch (e) {
                console.error("Failed to parse SSE data:", line, e);
              }
            }
          }
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        onErrorRef.current?.(error);
        setIsStreaming(false);
      } finally {
        abortControllerRef.current = null;
      }
    },
    [jobId, isStreaming]
  );

  return { isStreaming, error, send };
}
