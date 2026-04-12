"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { PathkrLogo } from "@/components/ui/pathkr-logo";

interface WorkspaceV2HeaderProps {
  filename: string | null;
  jobId: string;
  jobStatus?: "preparing" | "ready" | "failed";
  className?: string;
}

export function WorkspaceV2Header({
  filename,
  jobId,
  jobStatus,
  className,
}: WorkspaceV2HeaderProps) {
  const router = useRouter();
  const displayName = filename ?? "Document";

  return (
    <header
      className={cn(
        "relative z-10 flex items-start justify-between gap-4 px-5 py-4",
        "border-b border-[rgba(17,17,17,0.08)] bg-[rgba(255,255,255,0.28)] backdrop-blur-sm",
        className
      )}
    >
      {/* Left — logo + title */}
      <div className="flex items-start gap-3 min-w-0">
        {/* Path Karir logo — reuses the same component as landing page */}
        <PathkrLogo size="md" variant="light" className="flex-none pt-0.5" />

        {/* Divider */}
        <div className="mt-1.5 h-4 w-px bg-[rgba(17,17,17,0.12)] flex-none" aria-hidden="true" />

        {/* Title block */}
        <div className="min-w-0 pt-0.5">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[rgba(17,17,17,0.42)] mb-0.5">
            cv analysis workspace
          </p>
          <h1
            className="font-display text-[clamp(13px,1.6vw,18px)] font-black leading-[0.97] tracking-[-0.04em] text-[#111111] max-w-[480px] truncate"
          >
            {displayName}{" "}
            <span
              className="rounded-full px-[0.22em] inline-block"
              style={{ background: "rgba(202,255,67,0.82)" }}
            >
              optimized
            </span>
          </h1>
        </div>
      </div>

      {/* Right — status pills + back */}
      <div className="flex flex-none items-center gap-2 flex-wrap justify-end">
        {jobStatus === "ready" && (
          <span
            className="rounded-full px-3 py-2 text-[11px] font-black text-[#F5F2D8] border border-[rgba(255,255,255,0.08)]"
            style={{ background: "#111111" }}
          >
            Done
          </span>
        )}
        <button
          onClick={() => router.push(`/results/${jobId}`)}
          className="flex items-center gap-1 rounded-full border border-[rgba(17,17,17,0.1)] bg-[rgba(255,255,255,0.6)] px-3 py-2 text-[11px] font-black text-[#111111] transition-colors hover:bg-white"
          aria-label="Back to results"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back
        </button>
      </div>
    </header>
  );
}
