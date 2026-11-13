import { afterEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { useAuthRefresh } from "@/hooks/use-auth-refresh";
import { getMe } from "@/lib/auth";

const { refresh, replace, params } = vi.hoisted(() => ({
  refresh: vi.fn(() => Promise.resolve({ id: "1" })),
  replace: vi.fn(),
  params: new URLSearchParams("next=/app/cvs&attempt=1"),
}));
vi.mock("@/lib/auth-refresh", () => ({ refreshSession: refresh }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => params,
}));

function Timer() {
  useAuthRefresh(true);
  return null;
}

describe("auth session", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    refresh.mockClear();
    replace.mockClear();
  });

  it("refreshes after twelve minutes and stops on unmount", () => {
    vi.useFakeTimers();
    const view = render(<Timer />);
    vi.advanceTimersByTime(12 * 60 * 1000);
    expect(refresh).toHaveBeenCalledTimes(1);
    view.unmount();
    vi.advanceTimersByTime(12 * 60 * 1000);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("refreshes when a long-hidden tab becomes visible", () => {
    vi.useFakeTimers();
    const view = render(<Timer />);
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    document.dispatchEvent(new Event("visibilitychange"));
    vi.advanceTimersByTime(16 * 60 * 1000);
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    document.dispatchEvent(new Event("visibilitychange"));
    expect(refresh).toHaveBeenCalledTimes(1);
    view.unmount();
  });

  it("treats a guest 401 as normal without logging", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 401 })),
    );
    await expect(getMe()).resolves.toBeNull();
    expect(error).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it("restores the requested route after refresh", async () => {
    const { useAuthRestore } = await import("@/hooks/use-auth-restore");
    function Restore() {
      useAuthRestore();
      return null;
    }
    render(<Restore />);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/app/cvs"));
  });

  it("routes to login when refresh fails", async () => {
    refresh.mockRejectedValueOnce(new Error("expired"));
    const { useAuthRestore } = await import("@/hooks/use-auth-restore");
    function Restore() {
      useAuthRestore();
      return null;
    }
    render(<Restore />);
    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(
        "/?login=required&next=%2Fapp%2Fcvs",
      ),
    );
  });

  it("does not retry a second restore attempt", async () => {
    params.set("attempt", "2");
    const { useAuthRestore } = await import("@/hooks/use-auth-restore");
    function Restore() {
      useAuthRestore();
      return null;
    }
    render(<Restore />);
    expect(refresh).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith("/?login=required&next=%2Fapp%2Fcvs");
    params.set("attempt", "1");
  });
});
