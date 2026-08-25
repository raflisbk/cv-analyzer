"use client";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronLeft,
  Download,
  Loader2,
  Sparkles,
  Upload,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PathkrLogo } from "@/components/ui/pathkr-logo";
import Link from "next/link";
import { useWorkspaceV2Store } from "@/lib/stores/workspace-v2-store";
import { UserMenu } from "@/components/auth/user-menu";
import { downloadJobPdf } from "@/lib/workspace";
import { hexToRgba } from "@/lib/color-utils";

interface WorkspaceV2HeaderProps {
  filename: string | null;
  jobId: string;
  jobStatus?: "preparing" | "ready" | "failed";
  className?: string;
  uploadMode?: boolean;
}

export function WorkspaceV2Header({
  filename,
  jobId,
  jobStatus,
  className,
  uploadMode = false,
}: WorkspaceV2HeaderProps) {
  const router = useRouter();
  const displayName = filename ?? "Document";
  const overallScore = useWorkspaceV2Store(
    (s) => s.hydration?.analysis?.scores?.overall ?? null,
  );

  const isReady = jobStatus === "ready";
  const isPreparing = jobStatus === "preparing";

  const [isSaving, setIsSaving] = useState(false);

  const handleSavePdf = useCallback(async () => {
    if (isSaving) {
      return;
    }
    setIsSaving(true);
    toast("Preparing PDF download…");
    try {
      await downloadJobPdf(
        `/jobs/${jobId}/export/optimized`,
        "POST",
        `cv-optimized-${jobId.slice(0, 8)}.pdf`,
      );
      toast.success("PDF downloaded successfully");
    } catch (error) {
      toast.error(
        `PDF download failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsSaving(false);
    }
  }, [jobId, isSaving]);

  const scoreColor =
    overallScore === null
      ? null
      : overallScore >= 85
        ? "#CAFF43"
        : overallScore >= 70
          ? "#FF8C42"
          : "#FF4FCB";
  const scoreColorAlpha = (alpha: number) =>
    scoreColor ? hexToRgba(scoreColor, alpha) : undefined;

  return (
    <header
      className={cn(
        "relative z-10 flex items-center justify-between gap-4 px-5",
        className,
      )}
      style={{
        minHeight: 60,
        background: "rgba(245,242,216,0.88)",
        borderBottom: "1px dashed rgba(17,17,17,0.18)",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px border-b border-dashed border-[#141414]/20"
        style={{
          background: "transparent",
        }}
      />

      <div className="relative flex min-w-0 flex-1 items-center gap-3">
        <Link
          href="/"
          className="hover:opacity-80 transition-opacity rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#CAFF43]"
        >
          <PathkrLogo size="md" variant="light" className="flex-none" />
        </Link>

        <div
          className="h-5 w-px flex-none bg-[#141414]/[0.15]"
          aria-hidden="true"
        />

        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] leading-none mb-[3px] text-[#141414]/40">
            Workspace
            <span className="mx-1 opacity-50">/</span>
            {uploadMode ? "Upload" : "CV Analysis"}
          </p>

          <h1
            className="flex items-center gap-1.5 font-display font-black leading-none tracking-[-0.035em] truncate"
            style={{
              fontSize: "clamp(13px, 1.4vw, 17px)",
              color: "#141414",
              maxWidth: 380,
            }}
          >
            <span className="truncate">
              {uploadMode ? "New Analysis" : displayName}
            </span>
            {uploadMode ? (
              <span
                className="inline-flex flex-none items-center gap-0.5 rounded-full px-[0.45em] py-[0.12em]"
                style={{
                  background: "rgba(255,140,66,0.15)",
                  border: "1px solid rgba(255,140,66,0.35)",
                  color: "#FF8C42",
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: "0.02em",
                }}
              >
                <Upload className="h-2.5 w-2.5" aria-hidden="true" />
                upload
              </span>
            ) : isReady ? (
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
            ) : null}
          </h1>
        </div>
      </div>

      {!uploadMode && (
        <div className="relative flex flex-none items-center gap-2">
          {isPreparing && (
            <span
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black"
              style={{
                background: "rgba(255,140,66,0.12)",
                border: "1px solid rgba(255,140,66,0.32)",
                color: "#FF8C42",
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
                color: "#1a2900",
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

          {overallScore !== null && (
            <div
              className="flex items-baseline gap-0.5 rounded-full px-3 py-1.5"
              style={{
                background: scoreColorAlpha(0.094),
                border: `1px solid ${scoreColorAlpha(0.267)}`,
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
                style={{ color: scoreColorAlpha(0.533) }}
              >
                /100
              </span>
            </div>
          )}
        </div>
      )}

      <div className="relative flex flex-none items-center gap-2">
        <UserMenu />

        {!uploadMode && (
          <button
            type="button"
            onClick={handleSavePdf}
            disabled={isSaving}
            className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-black tracking-wide transition-all duration-150 hover:opacity-90 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "#141414",
              color: "#F5F2D8",
              border: "1px solid rgba(255,255,255,0.10)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.20)",
            }}
          >
            {isSaving ? (
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            ) : (
              <Download className="h-3 w-3" aria-hidden="true" />
            )}
            Save PDF
          </button>
        )}

        <button
          onClick={() => router.push(uploadMode ? "/" : `/results/${jobId}`)}
          className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-black text-[#141414] transition-all duration-150 active:scale-[0.97] bg-[#141414]/[0.06] border border-[#141414]/[0.13] hover:bg-[#141414]/[0.10] hover:border-[#141414]/[0.18]"
          aria-label={uploadMode ? "Back to home" : "Back to results"}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back
        </button>
      </div>
    </header>
  );
}
