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
  const { activeDetailTab, pdfUrl, setJobId, setHydration, setPdfUrl } =
    useWorkspaceV2Store();

  const isDetailFocus = activeDetailTab !== null;

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
      className="flex h-screen flex-col overflow-hidden bg-[--ws-bg] text-[--ws-ink]"
    >
      {/* Header — h-12 fixed */}
      <WorkspaceV2Header
        filename={hydration?.file.filename ?? null}
        jobId={jobId}
        jobStatus={hydration?.status}
        className="h-12 flex-none border-b border-[--ws-border-strong]"
      />

      {/* Body — 3-panel grid; mobile falls back to single column */}
      <div
        className="flex-1 overflow-hidden grid"
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
    </div>
  );
}

