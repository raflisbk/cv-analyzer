"use client";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useWorkspaceV2Store } from "@/lib/stores/workspace-v2-store";
import { WorkspaceV2Header } from "./header";
import { LeftDetailPanel } from "./left-detail-panel";
import { LeftPanelToggle } from "./left-panel-toggle";
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
  const { leftPanelOpen, pdfUrl, setJobId, setHydration, setPdfUrl } =
    useWorkspaceV2Store();

  // Inisialisasi store dengan job context
  useEffect(() => {
    setJobId(jobId);
    if (hydration) setHydration(hydration);
    if (initialPdfUrl) setPdfUrl(initialPdfUrl);
  }, [jobId, hydration, initialPdfUrl, setJobId, setHydration, setPdfUrl]);

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

      {/* Body — 3-panel grid on desktop, single column on mobile */}
      <div
        className={cn(
          "flex-1 overflow-hidden",
          // Grid transitions on left panel open/close
          leftPanelOpen
            ? "grid lg:grid-cols-[290px_minmax(0,1fr)_340px]"
            : "grid lg:grid-cols-[0px_minmax(0,1fr)_340px]",
          "transition-[grid-template-columns] duration-200 ease-in-out"
        )}
      >
        {/* Left detail panel — hidden mobile, collapsed by default */}
        <aside
          className={cn(
            "hidden lg:flex flex-col overflow-hidden",
            leftPanelOpen
              ? "w-[290px] opacity-100"
              : "w-0 overflow-hidden opacity-0 pointer-events-none",
            "transition-[width,opacity] duration-200 ease-in-out"
          )}
          aria-hidden={!leftPanelOpen}
        >
          <LeftDetailPanel className="h-full" />
        </aside>

        {/* Center PDF panel — full width on mobile */}
        <main className="relative flex flex-col overflow-hidden">
          {/* Toggle button — absolute, left edge of center panel */}
          <div className="absolute left-0 top-1/2 z-10 -translate-y-1/2 hidden lg:block">
            <LeftPanelToggle />
          </div>

          {/* PDF viewer — fills remaining space */}
          <PdfViewerPanel pdfUrl={pdfUrl} />
        </main>

        {/* Right rail — hidden on mobile */}
        <aside className="hidden lg:flex flex-col">
          <RightRailStats className="h-full" />
        </aside>
      </div>
    </div>
  );
}

