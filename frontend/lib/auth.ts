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
    // Auth is a single JWT cookie — there is no refresh-token endpoint on
    // the backend, so a 401 simply means "not signed in".
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
