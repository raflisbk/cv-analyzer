"use client";

import { useRouter } from "next/navigation";
import { logoutApi } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth-store";
import { GoogleLoginButton } from "./google-login-button";

interface UserMenuProps {
  onLoginSuccess?: () => void;
}

export function UserMenu({ onLoginSuccess }: UserMenuProps) {
  const { user, setUser } = useAuthStore();
  const router = useRouter();

  async function handleLogout() {
    await logoutApi();
    setUser(null);
    router.push("/");
  }

  if (!user) {
    return <GoogleLoginButton onSuccess={onLoginSuccess} />;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name ?? user.email}
            className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-200"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold text-white">
            {(user.name ?? user.email).charAt(0).toUpperCase()}
          </div>
        )}
        <span className="hidden text-sm text-slate-600 sm:block">
          {user.name ?? user.email}
        </span>
      </div>
      <button
        onClick={handleLogout}
        className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
      >
        Logout
      </button>
    </div>
  );
}
