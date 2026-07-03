"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { toast } from "sonner";
import { loginWithGoogle } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth-store";
import { cn } from "@/lib/utils";

interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  className?: string;
}

export function GoogleLoginButton({ onSuccess, className }: GoogleLoginButtonProps) {
  const setUser = useAuthStore((s) => s.setUser);
  const [isLoading, setIsLoading] = useState(false);

  const login = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (response) => {
      setIsLoading(true);
      try {
        const user = await loginWithGoogle(response.access_token);
        setUser(user);
        onSuccess?.();
      } catch {
        toast.error("Sign in failed", {
          description: "Could not sign in with Google. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <button
      onClick={() => login()}
      disabled={isLoading}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-full px-4 py-2 text-[13px] font-bold",
        "transition-all duration-200 active:scale-[0.97]",
        "border border-[#141414]/10 bg-white text-[#141414]/80",
        "shadow-[0_1px_2px_rgba(20,20,20,0.04),0_2px_10px_rgba(20,20,20,0.06)]",
        "hover:-translate-y-0.5 hover:border-[#141414]/[0.16] hover:text-[#141414]",
        "hover:shadow-[0_1px_2px_rgba(20,20,20,0.05),0_6px_20px_rgba(20,20,20,0.10)]",
        "disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-50",
        className
      )}
    >
      <span
        className="flex h-5 w-5 flex-none items-center justify-center rounded-full bg-[#141414]/[0.04] transition-colors duration-200 group-hover:bg-[#141414]/[0.07]"
        aria-hidden="true"
      >
        {isLoading ? (
          <span
            className="h-3 w-3 animate-spin rounded-full border-2"
            style={{
              borderColor: "rgba(17,17,17,0.15)",
              borderTopColor: "rgba(17,17,17,0.70)",
            }}
          />
        ) : (
          <GoogleIcon />
        )}
      </span>
      <span>{isLoading ? "Signing in..." : "Sign in with Google"}</span>
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-3.5 w-3.5 flex-none" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
