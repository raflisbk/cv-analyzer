"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { listConversations } from "@/lib/app-api/conversations";
import { groupHistory } from "@/lib/app-shell/group-history";
import { useAppShellFocusTrap } from "./use-app-shell-focus-trap";
import { useAuthStore } from "@/stores/auth-store";
import { logoutApi } from "@/lib/auth";

export function useAppShellHistoryDrawer(open: boolean, close: () => void) {
  const ref = useRef<HTMLElement>(null);
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["app-conversations"],
    queryFn: listConversations,
    enabled: open,
  });
  useAppShellFocusTrap(open, ref, close);
  const groups = groupHistory(data ?? []);
  const logOut = async () => {
    try {
      await logoutApi();
    } finally {
      setUser(null);
      close();
      router.push("/");
    }
  };
  return { ref, user, isLoading, isError, refetch, groups, logOut };
}
