"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { getSessions, revokeSession, type AuthSession } from "@/lib/auth";
import { sessionDevice, sessionLastUsed } from "@/lib/auth-session-format";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AccountSessions({ open, onOpenChange }: Props) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl bg-[#fff4ee] text-[#1a0b07]">
        <DialogTitle>Active sessions</DialogTitle>
        <DialogDescription>
          Devices signed in to your account.
        </DialogDescription>
        {error && <p role="alert">{error}</p>}
        <ul className="max-h-80 space-y-3 overflow-y-auto">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3"
            >
              <div>
                <strong>{sessionDevice(session.userAgent)}</strong>
                <small className="block">
                  Last used {sessionLastUsed(session.lastUsedAt)}
                </small>
                {session.current && (
                  <span className="text-sm font-bold">Current session</span>
                )}
              </div>
              {!session.current && (
                <button
                  type="button"
                  disabled={busy === session.id}
                  onClick={() => signOut(session.id)}
                  className="rounded-full bg-[#b81d00] px-3 py-2 font-bold text-white"
                >
                  Sign out
                </button>
              )}
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
