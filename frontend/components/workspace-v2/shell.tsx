"use client";
import { useEffect, useCallback, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { useWorkspaceV2Store } from "@/lib/stores/workspace-v2-store";
import { WorkspaceV2Header } from "./header";
import { LeftDetailPanel } from "./left-detail-panel";
import { PdfViewerPanel } from "./pdf-viewer-panel";
import { RightRailStats } from "./right-rail-stats";
import type { WorkspaceHydration } from "@/lib/workspace";
interface WorkspaceV2ShellProps {
  jobId: string;
  hydration: WorkspaceHydration | null;
  initialPdfUrl?: string | null;
}

export function WorkspaceV2Shell({
  jobId,
  hydration,
  initialPdfUrl,
}: WorkspaceV2ShellProps) {
  const { activeDetailTab, pdfUrl, viewMode, setViewMode, setJobId, setHydration, setPdfUrl } =
    useWorkspaceV2Store();

  const isDetailFocus = activeDetailTab !== null;
  const isDiffActive = viewMode === "original";

  // Fetch pdfUrl client-side so it's visible in DevTools and not dependent on SSR
  const fetchPdfUrl = useCallback(async () => {
    if (pdfUrl) { return; }
    try {
      const res = await fetch(`/api/v1/jobs/${jobId}/file`);
      if (!res.ok) { return; }
      const json = await res.json();
      const url = json?.data?.file_url;
      if (url) { setPdfUrl(url); }
    } catch {
      // silently fail — PDF viewer shows error state
    }
  }, [jobId, pdfUrl, setPdfUrl]);

  useEffect(() => {
    setJobId(jobId);
    if (hydration) { setHydration(hydration); }
    if (initialPdfUrl) {
      setPdfUrl(initialPdfUrl);
    } else {
      fetchPdfUrl();
    }
  }, [jobId, hydration, initialPdfUrl, setJobId, setHydration, setPdfUrl, fetchPdfUrl]);

  // Grid columns: narrow left strip by default, left expands + PDF collapses in detail-focus
  const gridStyle: CSSProperties = {
    gridTemplateColumns: isDetailFocus
      ? "minmax(480px, 1.08fr) 0px 300px"
      : "210px minmax(0, 1.18fr) 320px",
    transition: "grid-template-columns 250ms ease-in-out",
  };

  return (
    <div
      data-workspace-v2
      className="flex h-screen flex-col overflow-hidden text-[--ws-ink]"
      style={{
        background: [
          "radial-gradient(circle at top left, rgba(202,255,67,0.15) 0%, transparent 22%)",
          "radial-gradient(circle at top right, rgba(246,122,223,0.09) 0%, transparent 22%)",
          "radial-gradient(circle at bottom left, rgba(255,140,66,0.07) 0%, transparent 18%)",
          "#F5F2D8",
        ].join(", "),
      }}
    >
      {/* Dot grid decoration — editorial background texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(17,17,17,0.11) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 90% 90% at 50% 50%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 90% at 50% 50%, black 30%, transparent 100%)",
        }}
      />

      {/* Header — masthead style, height auto */}
      <WorkspaceV2Header
        filename={hydration?.file.filename ?? null}
        jobId={jobId}
        jobStatus={hydration?.status}
        className="relative z-10 flex-none"
      />

      {/* Body — 3-panel grid; mobile falls back to single column */}
      <div
        className="relative z-10 flex-1 overflow-hidden grid"
        style={gridStyle}
      >
        {/* Left detail panel — always visible on desktop (compact strip by default) */}
        <aside className="hidden lg:flex flex-col overflow-hidden border-r border-[--ws-border]">
          <LeftDetailPanel className="h-full" />
        </aside>

        {/* Center PDF panel — hidden when detail-focus is active */}
        <main
          className={cn(
            "relative flex flex-col overflow-hidden",
            "transition-opacity duration-250 ease-in-out",
            isDetailFocus && "opacity-0 pointer-events-none"
          )}
          aria-hidden={isDetailFocus}
        >
          <PdfViewerPanel pdfUrl={pdfUrl} />
        </main>

        {/* Right rail — overflow-hidden + min-h-0 ensures inner scroll works */}
        <aside className="hidden lg:flex flex-col border-l border-[--ws-border] overflow-hidden min-h-0">
          <RightRailStats className="h-full" />
        </aside>
      </div>

      {/* Action footer — in-flow light bar, right-aligned, never overlaps rails */}
      <footer
        className="relative z-10 flex-none flex justify-end items-center gap-1.5 px-4 py-2"
        style={{
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(17,17,17,0.07)",
        }}
        aria-label="Workspace actions"
      >
        {/* Apply */}
        <button
          type="button"
          className="flex items-center rounded-full px-3 py-1.5 text-[11px] font-black tracking-wide transition-colors hover:brightness-95"
          style={{
            background: "rgba(202,255,67,0.28)",
            border: "1px solid rgba(202,255,67,0.4)",
            color: "#2a4200",
          }}
        >
          Apply
        </button>

        {/* Diff toggle */}
        <button
          type="button"
          onClick={() => setViewMode(isDiffActive ? "optimized" : "original")}
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black tracking-wide transition-colors hover:brightness-95"
          style={{
            background: isDiffActive ? "rgba(246,122,223,0.2)" : "rgba(17,17,17,0.05)",
            border: isDiffActive
              ? "1px solid rgba(246,122,223,0.36)"
              : "1px solid rgba(17,17,17,0.10)",
            color: isDiffActive ? "#6b0050" : "#111111",
          }}
          aria-pressed={isDiffActive}
        >
          <span>Diff</span>
          <span
            className="rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider"
            style={{
              background: isDiffActive ? "rgba(246,122,223,0.12)" : "rgba(17,17,17,0.05)",
              border: "1px solid rgba(17,17,17,0.08)",
              color: "#111111",
              opacity: 0.72,
              minWidth: 52,
              textAlign: "center",
            }}
          >
            {isDiffActive ? "Original" : "Optimized"}
          </span>
        </button>

        {/* Save optimized PDF */}
        <button
          type="button"
          className="flex items-center whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-black tracking-wide transition-colors hover:brightness-95"
          style={{
            background: "rgba(255,140,66,0.14)",
            border: "1px solid rgba(255,140,66,0.28)",
            color: "#6b2d00",
          }}
        >
          Save PDF
        </button>

        {/* Save report */}
        <button
          type="button"
          className="flex items-center whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-black tracking-wide transition-colors hover:brightness-95"
          style={{
            background: "rgba(17,17,17,0.06)",
            border: "1px solid rgba(17,17,17,0.12)",
            color: "#111111",
          }}
        >
          Save Report
        </button>
      </footer>
    </div>
  );
}
