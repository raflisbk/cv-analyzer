"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AuthSession } from "@/lib/auth";
import { sessionDevice, sessionLastUsed } from "@/lib/auth-session-format";
import { useAuthSessions } from "@/hooks/use-auth-sessions";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SessionRow({
  session,
  busy,
  signOut,
}: {
  session: AuthSession;
  busy: boolean;
  signOut: (id: string) => void;
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3">
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
          disabled={busy}
          onClick={() => signOut(session.id)}
          className="rounded-full bg-[#b81d00] px-3 py-2 font-bold text-white"
        >
          Sign out
        </button>
      )}
    </li>
  );
}

export default function AccountSessions({ open, onOpenChange }: Props) {
  const { sessions, error, busy, signOut } = useAuthSessions(open);

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
            <SessionRow
              key={session.id}
              session={session}
              busy={busy === session.id}
              signOut={signOut}
            />
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
