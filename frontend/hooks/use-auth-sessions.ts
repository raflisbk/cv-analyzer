import { useEffect, useState } from "react";
import { getSessions, revokeSession, type AuthSession } from "@/lib/auth";

export function useAuthSessions(open: boolean) {
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
          setError("Could not load sessions.");
        }
      },
    );
    return () => {
      active = false;
    };
  }, [open]);

  async function signOut(id: string) {
    setBusy(id);
    try {
      await revokeSession(id);
      setSessions((items) => items.filter((item) => item.id !== id));
    } catch {
      setError("Could not sign out this session.");
    } finally {
      setBusy(null);
    }
  }
  return { sessions, error, busy, signOut };
}
