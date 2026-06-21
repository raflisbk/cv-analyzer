"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { useEffect } from "react";
import { getMe } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth-store";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setHydrated } = useAuthStore();

  useEffect(() => {
    if (process.env.NODE_ENV === "development" && !GOOGLE_CLIENT_ID) {
      console.warn(
        "[AuthProvider] NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set. Google OAuth will not work."
      );
    }
  }, []);

  useEffect(() => {
    getMe()
      .then((user) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setHydrated(true));
  }, [setUser, setHydrated]);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || "no-client-id"}>
      {children}
    </GoogleOAuthProvider>
  );
}
