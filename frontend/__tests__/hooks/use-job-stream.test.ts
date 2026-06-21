import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";

const mockConnect = vi.fn();
const mockClose = vi.fn();

vi.mock("@/lib/sse", () => ({
  SSEConnection: vi.fn().mockImplementation(function (this: any) {
    this.connect = mockConnect;
    this.close = mockClose;
  }),
  SSEMessage: undefined,
}));

import { useJobStream } from "@/hooks/use-job-stream";

describe("useJobStream", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockConnect.mockReset();
    mockClose.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null progress when jobId is null", () => {
    const { result } = renderHook(() => useJobStream(null));
    expect(result.current.progress).toBeNull();
    expect(result.current.isConnected).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("creates SSE connection when jobId is provided", () => {
    renderHook(() => useJobStream("job-123"));
    expect(mockConnect).toHaveBeenCalled();
  });

  it("resets state and closes previous connection when jobId changes", () => {
    const { rerender, result } = renderHook(
      ({ jobId }) => useJobStream(jobId),
      { initialProps: { jobId: "job-1" } }
    );

    rerender({ jobId: "job-2" });
    expect(mockClose).toHaveBeenCalled();
    expect(result.current.progress).toBeNull();
  });

  it("does not connect when jobId is empty string (falsy)", () => {
    renderHook(() => useJobStream(""));
    expect(mockConnect).not.toHaveBeenCalled();
  });
});
