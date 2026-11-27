import { useEffect, useState } from "react";
import { useT } from "@/components/i18n/i18n-provider";
import { getSessions, revokeSession, type AuthSession } from "@/lib/auth";

export function useAuthSessions(open: boolean) {
  const { t } = useT();
  const [sessions, setSessions] = useState<AuthSession[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }
    let active = true;
    getSessions().then(
      (items) => {
        if (active) {
          setSessions(items);
        }
      },
      () => {
        if (active) {
          setError(t("account.sessionsError"));
        }
      },
    );
    return () => {
      active = false;
    };
  }, [open, t]);

  async function signOut(id: string) {
    setBusy(id);
    try {
      await revokeSession(id);
      setSessions((items) => items.filter((item) => item.id !== id));
    } catch {
      setError(t("account.signOutError"));
    } finally {
      setBusy(null);
    }
  }
  return { sessions, error, busy, signOut };
}
