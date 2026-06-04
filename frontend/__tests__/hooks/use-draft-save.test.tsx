import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useDraftSave } from "@/hooks/use-draft-save";

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}));

vi.mock("use-debounce", () => ({
  useDebouncedCallback: vi.fn().mockImplementation((callback: Function) => {
    return (...args: unknown[]) => callback(...args);
  }),
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe("useDraftSave", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("starts with idle state", () => {
    const { result } = renderHook(() => useDraftSave("job-1"), {
      wrapper: createWrapper(),
    });
    expect(result.current.saveState).toBe("idle");
  });

  it("transitions to unsaved on markUnsaved", () => {
    const { result } = renderHook(() => useDraftSave("job-1"), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.markUnsaved({});
    });

    expect(result.current.saveState).toBe("unsaved");
  });

  it("saves and transitions to saved", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
    }) as unknown as typeof fetch;

    const { result } = renderHook(() => useDraftSave("job-1"), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.markUnsaved({ content: "test" });
    });

    await waitFor(() => {
      expect(result.current.saveState).toBe("saved");
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/workspace/content"),
      expect.objectContaining({ method: "PATCH" })
    );
  });

  it("transitions to error on save failure", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    }) as unknown as typeof fetch;

    const { result } = renderHook(() => useDraftSave("job-1"), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.markUnsaved({});
    });

    await waitFor(() => {
      expect(result.current.saveState).toBe("error");
    });
  });

  it("auto-clears saved state back to idle", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
    }) as unknown as typeof fetch;

    vi.useFakeTimers({ shouldAdvanceTime: true });

    const { result } = renderHook(() => useDraftSave("job-1"), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.markUnsaved({});
    });

    await waitFor(() => {
      expect(result.current.saveState).toBe("saved");
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.saveState).toBe("idle");

    vi.useRealTimers();
  });
});
