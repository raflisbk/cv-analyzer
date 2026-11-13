import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

const user = { id: "1", email: "a@b.com", name: "A", picture: null };

describe("silent refresh", () => {
  beforeEach(() => {
    useAuthStore.getState().setUser(user);
    vi.stubGlobal("fetch", vi.fn());
  });
  afterEach(() => vi.unstubAllGlobals());

  it("shares one refresh across concurrent 401 responses", async () => {
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockImplementation(async (url) => {
      if (String(url).endsWith("/auth/refresh"))
        return new Response(JSON.stringify(user));
      if (fetchMock.mock.calls.filter(([path]) => path === url).length === 1)
        return new Response("", { status: 401 });
      return new Response(JSON.stringify({ data: "ok" }));
    });
    await expect(
      Promise.all([apiFetch("/one"), apiFetch("/two")]),
    ).resolves.toEqual(["ok", "ok"]);
    expect(
      fetchMock.mock.calls.filter(([url]) =>
        String(url).endsWith("/auth/refresh"),
      ),
    ).toHaveLength(1);
  });

  it("clears the user and does not retry when refresh fails", async () => {
    const assign = vi.fn();
    vi.stubGlobal("window", {
      location: { pathname: "/app", search: "?view=editor", assign },
    });
    const fetchMock = vi
      .mocked(fetch)
      .mockImplementation(async () => new Response("", { status: 401 }));
    await expect(apiFetch("/protected")).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(useAuthStore.getState().user).toBeNull();
    expect(assign).toHaveBeenCalledWith(
      "/?login=required&next=%2Fapp%3Fview%3Deditor",
    );
  });

  it("retries a protected request only once", async () => {
    const fetchMock = vi
      .mocked(fetch)
      .mockImplementation(async (url) =>
        String(url).endsWith("/auth/refresh")
          ? new Response(JSON.stringify(user))
          : new Response("", { status: 401 }),
      );
    await expect(apiFetch("/protected")).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    expect(
      fetchMock.mock.calls.filter(([url]) =>
        String(url).endsWith("/protected"),
      ),
    ).toHaveLength(2);
  });

  it("uses a completed concurrent refresh for a late 401", async () => {
    let release: (() => void) | undefined;
    const delayed = new Promise<void>((resolve) => {
      release = resolve;
    });
    const counts = new Map<string, number>();
    const fetchMock = vi.mocked(fetch).mockImplementation(async (url) => {
      const path = String(url);
      if (path.endsWith("/auth/refresh"))
        return new Response(JSON.stringify(user));
      const count = (counts.get(path) ?? 0) + 1;
      counts.set(path, count);
      if (path.endsWith("/two") && count === 1) await delayed;
      return count === 1
        ? new Response("", { status: 401 })
        : new Response(JSON.stringify({ data: "ok" }));
    });
    const first = apiFetch("/one");
    const second = apiFetch("/two");
    await first;
    release?.();
    await expect(second).resolves.toBe("ok");
    expect(
      fetchMock.mock.calls.filter(([url]) =>
        String(url).endsWith("/auth/refresh"),
      ),
    ).toHaveLength(1);
  });
});
