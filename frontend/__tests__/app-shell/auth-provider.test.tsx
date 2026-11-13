import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/components/auth/auth-provider";
import { useAuthStore } from "@/stores/auth-store";

const { refreshSession } = vi.hoisted(() => ({ refreshSession: vi.fn() }));
vi.mock("@react-oauth/google", () => ({
  GoogleOAuthProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));
vi.mock("@/hooks/use-auth-refresh", () => ({ useAuthRefresh: vi.fn() }));
vi.mock("@/lib/auth-refresh", () => ({ refreshSession }));

const user = {
  id: "1",
  email: "person@example.com",
  name: "Person",
  picture: null,
};

function mountProvider() {
  const client = new QueryClient();
  return render(
    <QueryClientProvider client={client}>
      <AuthProvider>
        <span>Landing</span>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe("AuthProvider session hint", () => {
  beforeEach(() => {
    document.cookie = "session_hint=; Max-Age=0; Path=/";
    useAuthStore.setState({ user: null, isHydrated: false });
    refreshSession.mockReset();
  });

  afterEach(() => vi.unstubAllGlobals());

  it("hydrates a guest without requesting auth/me", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    mountProvider();
    await waitFor(() => expect(useAuthStore.getState().isHydrated).toBe(true));
    expect(useAuthStore.getState().user).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("requests auth/me once when the hint exists", async () => {
    document.cookie = "session_hint=1; Path=/";
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify(user), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);
    mountProvider();
    await waitFor(() => expect(useAuthStore.getState().user).toEqual(user));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(refreshSession).not.toHaveBeenCalled();
  });

  it("clears stale user and attempts refresh after an expired access session", async () => {
    document.cookie = "session_hint=1; Path=/";
    useAuthStore.getState().setUser(user);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 401 })),
    );
    refreshSession.mockRejectedValue(new Error("expired"));
    mountProvider();
    await waitFor(() => expect(useAuthStore.getState().isHydrated).toBe(true));
    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().user).toBeNull();
    expect(document.cookie).toContain("session_hint=1");
  });
});
