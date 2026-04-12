"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

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
      {/* Left — brand mark + title */}
      <div className="flex items-start gap-3 min-w-0">
        {/* Brand mark */}
        <div
          className="flex-none grid place-items-center rounded-xl font-black text-[13px] tracking-wider"
          style={{
            width: 40, height: 40,
            background: "#111111",
            color: "#F5F2D8",
            letterSpacing: "0.04em",
          }}
          aria-label="Pathkr"
        >
          PK
        </div>

        {/* Title block */}
        <div className="min-w-0 pt-0.5">
          <p
            className="text-[10px] font-black uppercase tracking-[0.14em] text-[rgba(17,17,17,0.42)] mb-1"
          >
            pathkr / cv analysis workspace
          </p>
          <h1
            className="font-display text-[clamp(14px,2vw,20px)] font-black leading-[0.97] tracking-[-0.04em] text-[#111111] max-w-[520px] truncate"
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

      {/* Right — pills + back */}
      <div className="flex flex-none items-center gap-2 flex-wrap justify-end">
        <span
          className="rounded-full px-3 py-2 text-[11px] font-black border"
          style={{ background: "rgba(202,255,67,0.24)", borderColor: "rgba(202,255,67,0.3)" }}
        >
          CV analysis only
        </span>
        <span
          className="rounded-full px-3 py-2 text-[11px] font-black border"
          style={{ background: "rgba(246,122,223,0.14)", borderColor: "rgba(246,122,223,0.2)" }}
        >
          Detail tabs
        </span>
        {jobStatus === "ready" && (
          <span
            className="rounded-full px-3 py-2 text-[11px] font-black text-[#F5F2D8] border-[rgba(255,255,255,0.08)]"
            style={{ background: "#111111", borderColor: "rgba(255,255,255,0.08)" }}
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
