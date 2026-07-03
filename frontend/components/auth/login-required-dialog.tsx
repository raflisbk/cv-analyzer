"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { GoogleLoginButton } from "@/components/auth/google-login-button";

const DEFAULT_NEXT_PATH = "/workspace-v2/new";

function safeNextPath(next: string | null): string {
  if (!next) {
    return DEFAULT_NEXT_PATH;
  }
  // Only allow same-site relative paths — reject protocol-relative ("//evil.com")
  // and absolute URLs to avoid an open redirect via the `next` query param.
  if (next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }
  return DEFAULT_NEXT_PATH;
}

export function LoginRequiredDialog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [nextPath, setNextPath] = useState(DEFAULT_NEXT_PATH);

  useEffect(() => {
    if (searchParams.get("login") === "required") {
      setNextPath(safeNextPath(searchParams.get("next")));
      setOpen(true);
    }
  }, [searchParams]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      // Strip login/next query params so a refresh or back-navigation
      // doesn't silently reopen the dialog.
      router.replace("/");
    }
  }

  function handleLoginSuccess() {
    setOpen(false);
    router.push(nextPath);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        hideCloseButton
        overlayClassName="bg-[#141414]/60 backdrop-blur-sm"
        className="max-w-sm rounded-[2rem] border-2 border-[#141414] bg-[#F5F2D8] p-8 text-center shadow-[0_20px_60px_rgba(20,20,20,0.35)] sm:rounded-[2rem]"
      >
        <button
          onClick={() => handleOpenChange(false)}
          aria-label="Close"
          className="absolute right-5 top-5 rounded-full p-1.5 text-[#141414]/40 transition-colors hover:bg-[#141414]/[0.06] hover:text-[#141414]/80"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </button>

        <div className="relative mx-auto mb-5 h-16 w-16">
          <div
            aria-hidden="true"
            className="absolute inset-0 translate-x-1 translate-y-1 rounded-2xl bg-[#141414]/20"
          />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[#141414] bg-[#CAFF43]">
            <Lock className="h-7 w-7 text-[#141414]" strokeWidth={2.4} />
          </div>
          <Sparkles
            className="absolute -right-2 -top-2 h-5 w-5 text-[#FF4FCB]"
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </div>

        <DialogHeader className="items-center space-y-2">
          <DialogTitle className="font-display text-2xl font-extrabold tracking-tight text-[#141414]">
            Sign in to continue
          </DialogTitle>
          <DialogDescription className="max-w-[26ch] text-[15px] leading-relaxed text-[#141414]/60">
            You&apos;ll need an account to analyze your CV and come back to
            your results anytime.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 flex flex-col items-center gap-3">
          <GoogleLoginButton
            onSuccess={handleLoginSuccess}
            className="w-full justify-center border-2 border-[#141414] bg-[#141414] py-3 text-[15px] text-[#F5F2D8] shadow-[0_4px_16px_rgba(20,20,20,0.2)] hover:bg-[#141414]/90 hover:text-[#F5F2D8]"
          />
          <p className="font-sans text-xs font-semibold tracking-wide text-[#141414]/35">
            Free forever. No credit card required.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
