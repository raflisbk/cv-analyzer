"use client";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useWorkspaceV2Store } from "@/lib/stores/workspace-v2-store";
import { WorkspaceV2Header } from "./header";
import type { WorkspaceHydration } from "@/lib/workspace";

interface WorkspaceV2ShellProps {
  jobId: string;
  hydration: WorkspaceHydration | null;
}

export function WorkspaceV2Shell({ jobId, hydration }: WorkspaceV2ShellProps) {
  const { leftPanelOpen, setJobId, setHydration } = useWorkspaceV2Store();

  // Inisialisasi store dengan job context
  useEffect(() => {
    setJobId(jobId);
    if (hydration) setHydration(hydration);
  }, [jobId, hydration, setJobId, setHydration]);

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
          "grid lg:grid-cols-[290px_minmax(0,1fr)_340px]",
          // Transition grid template ketika left panel toggle
          leftPanelOpen
            ? "lg:grid-cols-[290px_minmax(0,1fr)_340px]"
            : "lg:grid-cols-[0px_minmax(0,1fr)_340px]",
          "transition-[grid-template-columns] duration-200 ease-in-out"
        )}
      >
        {/* Left panel — hidden di mobile, collapsed by default */}
        {/* Placeholder — akan diisi LeftDetailPanel di Plan 05 */}
        <aside
          className={cn(
            "hidden lg:flex flex-col overflow-hidden",
            "bg-[--ws-surface] border-r border-[--ws-border]",
            leftPanelOpen ? "w-[290px]" : "w-0 overflow-hidden opacity-0 pointer-events-none",
            "transition-[width,opacity] duration-200 ease-in-out"
          )}
          aria-hidden={!leftPanelOpen}
        >
          {/* LeftDetailPanel — Plan 05 */}
        </aside>

        {/* Center PDF panel */}
        {/* Placeholder — akan diisi PdfViewerPanel di Plan 05 */}
        <main className="relative flex flex-col overflow-hidden bg-[--ws-bg]">
          {/* PdfViewerPanel + LeftPanelToggle — Plan 05 */}
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-[--ws-ink-ghost]">
              PDF viewer sedang disiapkan...
            </p>
          </div>
        </main>

        {/* Right rail — hidden di mobile */}
        {/* Placeholder — akan diisi RightRailStats di Plan 05 */}
        <aside
          className="hidden lg:flex flex-col bg-[--ws-surface] border-l border-[--ws-border] w-[340px] overflow-y-auto"
        >
          {/* RightRailStats — Plan 05 */}
        </aside>
      </div>
    </div>
  );
}
