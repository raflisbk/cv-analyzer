import { AuthUser } from "@/stores/auth-store";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function loginWithGoogle(accessToken: string): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/api/v1/auth/google`, {
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
    const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
      credentials: "include",
    });

    if (res.status === 401) { return null; }
    if (!res.ok) { return null; }

    return res.json() as Promise<AuthUser>;
  } catch {
    return null;
  }
}

export async function logoutApi(): Promise<void> {
  await fetch(`${API_BASE}/api/v1/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}
