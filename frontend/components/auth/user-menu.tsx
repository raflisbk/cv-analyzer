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
    <div className="flex items-center gap-2.5">
      <div className="flex items-center gap-2">
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name ?? user.email}
            className="h-8 w-8 flex-none rounded-full object-cover"
            style={{ boxShadow: "0 0 0 2px rgba(202,255,67,0.5)" }}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div
            className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-xs font-black"
            style={{ background: "#141414", color: "#F5F2D8" }}
          >
            {(user.name ?? user.email).charAt(0).toUpperCase()}
          </div>
        )}
        <span
          className="hidden text-[13px] font-bold sm:block"
          style={{ color: "rgba(17,17,17,0.65)" }}
        >
          {user.name ?? user.email}
        </span>
      </div>

      <button
        onClick={handleLogout}
        className="rounded-full px-3 py-1.5 text-[12px] font-bold transition-all duration-150
          border border-transparent text-[#141414]/[0.45]
          hover:bg-[#141414]/[0.06] hover:border-[#141414]/10 hover:text-[#141414]/[0.75]"
      >
        Logout
      </button>
    </div>
  );
}
