import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { localeWrapper } from "../i18n/render-with-locale";

const captured: {
  onMessage?: (data: Record<string, unknown>) => void;
  onError?: (error: Error) => void;
} = {};

vi.mock("@/lib/sse", () => ({
  SSEConnection: vi.fn().mockImplementation(function (
    this: Record<string, unknown>,
    _url: string,
    onMessage: (data: Record<string, unknown>) => void,
    onError: (error: Error) => void,
  ) {
    captured.onMessage = onMessage;
    captured.onError = onError;
    this.connect = vi.fn();
    this.close = vi.fn();
  }),
}));

import { useJobStream } from "@/hooks/use-job-stream";

const progress = (stage: string, extra: Record<string, unknown> = {}) => ({
  type: "progress",
  job_id: "job-1",
  stage,
  percentage: 50,
  message: stage,
  ...extra,
});

function mockJobStatus(statuses: string[]) {
  const queue = [...statuses];
  const fetchMock = vi.fn().mockImplementation(async () => ({
    ok: true,
    json: async () => ({ data: { status: queue.shift() ?? "analyzing" } }),
  }));
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const render = (onComplete = vi.fn()) =>
  renderHook(() => useJobStream("job-1", { onComplete }), {
    wrapper: localeWrapper,
  });

describe("useJobStream resilience", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("uses the step carried by the payload", () => {
    const { result } = render();
    act(() => captured.onMessage?.(progress("scoring", { step: 2, steps: 5 })));
    expect(result.current.progress?.step).toBe(2);
  });

  it("maps a stage name to its step when the payload has none", () => {
    const { result } = render();
    act(() => captured.onMessage?.(progress("grammar_check")));
    expect(result.current.progress?.step).toBe(3);
  });

  it("never resets the step to zero for an unknown stage", () => {
    const { result } = render();
    act(() => captured.onMessage?.(progress("scoring", { step: 2 })));
    act(() => captured.onMessage?.(progress("some_future_stage")));
    expect(result.current.progress?.step).toBe(2);
  });

  it("passes indexing counts through", () => {
    const { result } = render();
    act(() =>
      captured.onMessage?.(
        progress("indexing_cv", { step: 4, done: 7, total: 15 }),
      ),
    );
    expect(result.current.progress).toMatchObject({ done: 7, total: 15 });
  });

  it("does not report the first stream drop as an error", () => {
    const { result } = render();
    mockJobStatus([]);
    act(() => captured.onError?.(new Error("dropped")));
    expect(result.current.error).toBeNull();
  });

  it("polls the job every three seconds from the first drop", async () => {
    const fetchMock = mockJobStatus([]);
    render();
    await act(async () => captured.onError?.(new Error("dropped")));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/v1/jobs/job-1");
    await act(async () => vi.advanceTimersByTimeAsync(3000));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await act(async () => vi.advanceTimersByTimeAsync(3000));
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("keeps polling across repeated drops without duplicating timers", async () => {
    const fetchMock = mockJobStatus([]);
    render();
    await act(async () => captured.onError?.(new Error("1")));
    await act(async () => captured.onError?.(new Error("2")));
    fetchMock.mockClear();
    await act(async () => vi.advanceTimersByTimeAsync(3000));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("reflects completion within one poll interval when the stream never recovers", async () => {
    mockJobStatus(["analyzing", "complete"]);
    const onComplete = vi.fn();
    const { result } = render(onComplete);
    await act(async () => captured.onError?.(new Error("dropped")));
    expect(onComplete).not.toHaveBeenCalled();
    await act(async () => vi.advanceTimersByTimeAsync(3000));
    expect(onComplete).toHaveBeenCalledWith("job-1");
    expect(result.current.progress).toMatchObject({
      stage: "complete",
      step: 5,
    });
  });

  it("stops polling once a terminal status is seen", async () => {
    const fetchMock = mockJobStatus(["failed"]);
    const { result } = render();
    await act(async () => captured.onError?.(new Error("dropped")));
    expect(result.current.progress?.stage).toBe("failed");
    fetchMock.mockClear();
    await act(async () => vi.advanceTimersByTimeAsync(9000));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("stops polling when the stream delivers complete", async () => {
    const fetchMock = mockJobStatus([]);
    render();
    await act(async () => captured.onError?.(new Error("dropped")));
    act(() => captured.onMessage?.(progress("complete", { step: 5 })));
    fetchMock.mockClear();
    await act(async () => vi.advanceTimersByTimeAsync(9000));
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
