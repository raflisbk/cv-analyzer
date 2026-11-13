import type { AuthUser } from "@/stores/auth-store";
import { useAuthStore } from "@/stores/auth-store";

let inFlight: Promise<AuthUser> | null = null;
let refreshVersion = 0;

export function currentRefreshVersion(): number {
  return refreshVersion;
}

function redirectToLogin() {
  if (typeof window === "undefined") {
    return;
  }
  if (window.location.pathname === "/session/restore") {
    return;
  }
  const next = window.location.pathname + window.location.search;
  const params = new URLSearchParams({ login: "required", next });
  window.location.assign(`/?${params}`);
}

async function requestRefresh(): Promise<AuthUser> {
  const response = await fetch("/api/v1/auth/refresh", {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    if (response.status === 401) {
      useAuthStore.getState().setUser(null);
      redirectToLogin();
    }
    throw new Error("Session refresh failed.");
  }
  const user = (await response.json()) as AuthUser;
  useAuthStore.getState().setUser(user);
  refreshVersion += 1;
  return user;
}

export function refreshSession(): Promise<AuthUser> {
  if (!inFlight) {
    inFlight = requestRefresh().finally(() => {
      inFlight = null;
    });
  }
  return inFlight;
}
