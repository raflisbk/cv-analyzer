"use client";
import { useRouter } from "next/navigation";
import { ChevronLeft, Download, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { PathkrLogo } from "@/components/ui/pathkr-logo";
import Link from "next/link";
import { useWorkspaceV2Store } from "@/lib/stores/workspace-v2-store";

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
  const overallScore = useWorkspaceV2Store(
    (s) => s.hydration?.analysis?.scores?.overall ?? null
  );

  const isReady = jobStatus === "ready";
  const isPreparing = jobStatus === "preparing";

  // Score grade for color
  const scoreColor =
    overallScore === null
      ? null
      : overallScore >= 85
      ? "#CAFF43"
      : overallScore >= 70
      ? "#FF8C42"
      : "#f87171";

  return (
    <header
      className={cn(
        "relative z-10 flex items-center justify-between gap-4 px-5",
        className
      )}
      style={{
        minHeight: 60,
        background: "rgba(245,242,216,0.88)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(17,17,17,0.09)",
        boxShadow:
          "0 1px 0 rgba(255,255,255,0.9) inset, 0 4px 24px rgba(17,17,17,0.06)",
      }}
    >
      {/* Lime accent hairline at very bottom */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(202,255,67,0.45) 30%, rgba(202,255,67,0.6) 50%, rgba(202,255,67,0.45) 70%, transparent 100%)",
        }}
      />

      {/* ── Left: Logo + divider + breadcrumb/title ── */}
      <div className="relative flex min-w-0 flex-1 items-center gap-3">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <PathkrLogo size="md" variant="light" className="flex-none" />
        </Link>

        {/* Divider */}
        <div
          className="h-5 w-px flex-none"
          style={{ background: "rgba(17,17,17,0.15)" }}
          aria-hidden="true"
        />

        {/* Title block */}
        <div className="min-w-0">
          {/* Breadcrumb */}
          <p
            className="text-[10px] font-black uppercase tracking-[0.15em] leading-none mb-[3px]"
            style={{ color: "rgba(17,17,17,0.38)" }}
          >
            Workspace
            <span className="mx-1 opacity-50">/</span>
            CV Analysis
          </p>

          {/* Document title */}
          <h1
            className="flex items-center gap-1.5 font-display font-black leading-none tracking-[-0.035em] truncate"
            style={{
              fontSize: "clamp(13px, 1.4vw, 17px)",
              color: "#141414",
              maxWidth: 380,
            }}
          >
            <span className="truncate">{displayName}</span>
            <span
              className="inline-flex flex-none items-center gap-0.5 rounded-full px-[0.45em] py-[0.12em]"
              style={{
                background: "#CAFF43",
                color: "#1a2900",
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: "0.02em",
              }}
            >
              <Sparkles className="h-2.5 w-2.5" aria-hidden="true" />
              optimized
            </span>
          </h1>
        </div>
      </div>

      {/* ── Center: Status + Score ── */}
      <div className="relative flex flex-none items-center gap-2">
        {isPreparing && (
          <span
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black"
            style={{
              background: "rgba(255,140,66,0.12)",
              border: "1px solid rgba(255,140,66,0.32)",
              color: "#7a3500",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ background: "#FF8C42" }}
              aria-hidden="true"
            />
            Preparing…
          </span>
        )}

        {isReady && (
          <span
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black"
            style={{
              background: "rgba(202,255,67,0.18)",
              border: "1px solid rgba(202,255,67,0.45)",
              color: "#294000",
            }}
          >
            <Zap
              className="h-3 w-3"
              style={{ fill: "#CAFF43", stroke: "#CAFF43" }}
              aria-hidden="true"
            />
            Ready
          </span>
        )}

        {/* Score badge */}
        {overallScore !== null && (
          <div
            className="flex items-baseline gap-0.5 rounded-full px-3 py-1.5"
            style={{
              background: `${scoreColor}18`,
              border: `1px solid ${scoreColor}44`,
            }}
            title="Overall CV score"
          >
            <span
              className="text-[15px] font-black leading-none"
              style={{ color: scoreColor ?? undefined }}
            >
              {overallScore}
            </span>
            <span
              className="text-[10px] font-bold"
              style={{ color: `${scoreColor}88` }}
            >
              /100
            </span>
          </div>
        )}
      </div>

      {/* ── Right: CTAs ── */}
      <div className="relative flex flex-none items-center gap-1.5">
        {/* Save PDF — primary action */}
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-black tracking-wide transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
          style={{
            background: "#141414",
            color: "#F5F2D8",
            border: "1px solid rgba(255,255,255,0.10)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.20)",
          }}
        >
          <Download className="h-3 w-3" aria-hidden="true" />
          Save PDF
        </button>

        {/* Back */}
        <button
          onClick={() => router.push(`/results/${jobId}`)}
          className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-black text-[#141414] transition-all duration-150 active:scale-[0.97]"
          style={{
            background: "rgba(17,17,17,0.06)",
            border: "1px solid rgba(17,17,17,0.13)",
          }}
          aria-label="Back to results"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back
        </button>
      </div>
    </header>
  );
}
