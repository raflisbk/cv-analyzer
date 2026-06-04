import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useChatStream } from "@/hooks/use-chat-stream";

describe("useChatStream", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns initial state with no streaming", () => {
    const { result } = renderHook(() =>
      useChatStream("job-1", {
        apiUrl: "http://localhost:8000/api/v1",
      })
    );

    expect(result.current.isStreaming).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("does not send when jobId is undefined", async () => {
    const onToken = vi.fn();
    const { result } = renderHook(() =>
      useChatStream(undefined, {
        apiUrl: "http://localhost:8000/api/v1",
        onToken,
      })
    );

    await act(async () => {
      result.current.send("hello");
    });

    expect(onToken).not.toHaveBeenCalled();
  });

  it("sends message and streams tokens", async () => {
    const encoder = new TextEncoder();
    const tokens = [
      encoder.encode('data: {"token":"Hello"}\n'),
      encoder.encode('data: {"token":" world"}\n'),
      encoder.encode('data: {"type":"complete"}\n'),
    ];

    let tokenIndex = 0;
    const mockReader = {
      read: vi.fn().mockImplementation(() => {
        if (tokenIndex < tokens.length) {
          return Promise.resolve({ done: false, value: tokens[tokenIndex++] });
        }
        return Promise.resolve({ done: true, value: undefined });
      }),
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: { getReader: () => mockReader },
    }) as unknown as typeof fetch;

    const onToken = vi.fn();
    const onComplete = vi.fn();

    const { result } = renderHook(() =>
      useChatStream("job-1", {
        apiUrl: "http://localhost:8000/api/v1",
        onToken,
        onComplete,
      })
    );

    await act(async () => {
      result.current.send("hello");
    });

    await waitFor(() => {
      expect(onToken).toHaveBeenCalledWith("Hello");
      expect(onToken).toHaveBeenCalledWith(" world");
      expect(onComplete).toHaveBeenCalled();
    });
  });

  it("handles HTTP errors", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: "Internal Server Error",
    }) as unknown as typeof fetch;

    const onError = vi.fn();

    const { result } = renderHook(() =>
      useChatStream("job-1", {
        apiUrl: "http://localhost:8000/api/v1",
        onError,
      })
    );

    await act(async () => {
      result.current.send("hello");
    });

    await waitFor(() => {
      expect(onError).toHaveBeenCalled();
      expect(result.current.error).not.toBeNull();
    });
  });

  it("prevents sending while already streaming", async () => {
    const encoder = new TextEncoder();
    const mockReader = {
      read: vi.fn().mockImplementation(() => {
        return new Promise(() => {});
      }),
    };

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      body: { getReader: () => mockReader },
    }) as unknown as typeof fetch;

    const { result } = renderHook(() =>
      useChatStream("job-1", {
        apiUrl: "http://localhost:8000/api/v1",
      })
    );

    await act(async () => {
      result.current.send("first");
    });

    expect(result.current.isStreaming).toBe(true);

    const fetchCallsBefore = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.length;
    await act(async () => {
      result.current.send("second");
    });

    const fetchCallsAfter = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls.length;
    expect(fetchCallsAfter).toBe(fetchCallsBefore);
  });
});
