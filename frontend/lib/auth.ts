import { AuthUser } from "@/stores/auth-store";

const API_BASE = "/api/v1";

// Deduplication: if many concurrent requests trigger a refresh simultaneously,
// only one actual POST /auth/refresh is sent; all callers await the same promise.
let _refreshPromise: Promise<boolean> | null = null;

export async function refreshTokens(): Promise<boolean> {
  if (!_refreshPromise) {
    _refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        _refreshPromise = null;
      });
  }
  return _refreshPromise;
}

export async function loginWithGoogle(accessToken: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ access_token: accessToken }),
  });

  if (!res.ok) {
    throw new Error("Google login failed.");
  }

  return res.json() as Promise<AuthUser>;
}

export async function getMe(): Promise<AuthUser | null> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });

    if (res.status === 401) {
      const refreshed = await refreshTokens();
      if (!refreshed) return null;

      const retry = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
      if (!retry.ok) return null;
      return retry.json() as Promise<AuthUser>;
    }

    if (!res.ok) return null;
    return res.json() as Promise<AuthUser>;
  } catch {
    return null;
  }
}

export async function logoutApi(): Promise<void> {
  await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}
