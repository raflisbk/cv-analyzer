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

      {/* Sticky action footer — dark capsule, bottom-right, matches mockup */}
      <footer
        className="pointer-events-none fixed bottom-4 right-4 z-50 flex justify-end"
        aria-label="Workspace actions"
      >
        <div
          className="pointer-events-auto flex items-center gap-1.5 rounded-full p-2"
          style={{
            background: "rgba(20,20,20,0.88)",
            backdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 12px 28px rgba(17,17,17,0.16)",
          }}
        >
          {/* Apply */}
          <button
            type="button"
            className="flex items-center rounded-full px-3 py-2 text-[11px] font-black tracking-wide transition-opacity hover:opacity-80"
            style={{
              background: "rgba(202,255,67,0.12)",
              border: "1px solid rgba(202,255,67,0.18)",
              color: "rgba(224,255,142,0.98)",
            }}
          >
            Apply
          </button>

          {/* Diff toggle */}
          <button
            type="button"
            onClick={() => setViewMode(isDiffActive ? "optimized" : "original")}
            className="flex items-center gap-2 rounded-full px-3 py-2 text-[11px] font-black tracking-wide transition-opacity hover:opacity-80"
            style={{
              background: isDiffActive ? "rgba(246,122,223,0.16)" : "rgba(255,255,255,0.04)",
              border: isDiffActive
                ? "1px solid rgba(246,122,223,0.24)"
                : "1px solid rgba(246,122,223,0.14)",
              color: isDiffActive ? "rgba(255,243,251,0.98)" : "rgba(255,222,247,0.92)",
            }}
            aria-pressed={isDiffActive}
          >
            <span>Diff</span>
            <span
              className="rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider"
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(245,242,216,0.84)",
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
            className="flex items-center whitespace-nowrap rounded-full px-3 py-2 text-[11px] font-black tracking-wide transition-opacity hover:opacity-80"
            style={{
              background: "rgba(255,140,66,0.09)",
              border: "1px solid rgba(255,140,66,0.16)",
              color: "rgba(255,204,168,0.96)",
            }}
          >
            Save PDF
          </button>

          {/* Save report */}
          <button
            type="button"
            className="flex items-center whitespace-nowrap rounded-full px-3 py-2 text-[11px] font-black tracking-wide transition-opacity hover:opacity-80"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.09)",
              color: "rgba(245,242,216,0.82)",
            }}
          >
            Save Report
          </button>
        </div>
      </footer>
    </div>
  );
}
