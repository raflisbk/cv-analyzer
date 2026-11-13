import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { refreshSession } from "@/lib/auth-refresh";
import { safeNextPath } from "@/lib/auth-next-path";

export function useAuthRestore() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNextPath(params.get("next"));
  const login = `/?${new URLSearchParams({ login: "required", next })}`;

  useEffect(() => {
    if (
      Number(params.get("attempt")) >= 2 ||
      next.startsWith("/session/restore")
    ) {
      router.replace(login);
      return;
    }
    let cancelled = false;
    refreshSession().then(
      () => {
        if (!cancelled) router.replace(next);
      },
      () => {
        if (!cancelled) router.replace(login);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [login, next, params, router]);
}
