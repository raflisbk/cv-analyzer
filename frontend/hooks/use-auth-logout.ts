import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { logoutAllApi, logoutApi } from "@/lib/auth";
import { useAuthStore } from "@/stores/auth-store";

export function useAuthLogout(onComplete?: () => void) {
  const setUser = useAuthStore((state) => state.setUser);
  const queryClient = useQueryClient();
  const router = useRouter();

  return async (all = false) => {
    try {
      if (all) {
        await logoutAllApi();
      } else {
        await logoutApi();
      }
    } catch {
    } finally {
      setUser(null);
      queryClient.clear();
      onComplete?.();
      router.replace("/");
    }
  };
}
