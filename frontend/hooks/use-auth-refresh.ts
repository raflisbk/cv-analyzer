import { useEffect } from "react";
import { refreshSession } from "@/lib/auth-refresh";

const ACCESS_LIFETIME = 15 * 60 * 1000;
const REFRESH_INTERVAL = 12 * 60 * 1000;

export function useAuthRefresh(active: boolean) {
  useEffect(() => {
    if (!active) return;
    let hiddenAt: number | null = null;
    const refresh = () => {
      if (document.visibilityState === "visible")
        void refreshSession().catch(() => {});
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") hiddenAt = Date.now();
      else if (hiddenAt !== null && Date.now() - hiddenAt >= ACCESS_LIFETIME)
        refresh();
      if (document.visibilityState === "visible") hiddenAt = null;
    };
    const timer = window.setInterval(refresh, REFRESH_INTERVAL);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [active]);
}
