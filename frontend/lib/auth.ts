import { AuthUser } from "@/stores/auth-store";

const API_BASE = "/api/v1";

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

    if (!res.ok) {
      return null;
    }
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

export async function logoutAllApi(): Promise<void> {
  const response = await fetch(`${API_BASE}/auth/logout-all`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Could not log out of all devices.");
  }
}

export interface AuthSession {
  id: string;
  createdAt: string;
  lastUsedAt: string;
  userAgent: string | null;
  ip: string | null;
  current: boolean;
}

export async function getSessions(): Promise<AuthSession[]> {
  const response = await fetch(`${API_BASE}/auth/sessions`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Could not load sessions.");
  }
  return response.json() as Promise<AuthSession[]>;
}

export async function revokeSession(id: string): Promise<void> {
  const response = await fetch(
    `${API_BASE}/auth/sessions/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );
  if (!response.ok) {
    throw new Error("Could not sign out this session.");
  }
}
