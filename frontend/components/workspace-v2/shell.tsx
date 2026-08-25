"use client";
import { useEffect, useCallback, useState, type CSSProperties } from "react";
import { toast } from "sonner";
import {
  Wand2,
  GitCompare,
  Download,
  FileText,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceV2Store } from "@/lib/stores/workspace-v2-store";
import { useWorkspaceDoc } from "@/hooks/use-workspace-doc";
import { WorkspaceV2Header } from "./header";
import { LeftDetailPanel } from "./left-detail-panel";
import { PdfViewerPanel } from "./pdf-viewer-panel";
import { ChatPanel } from "./chat-panel";
import { UploadPanel } from "./upload-panel";
import { getWorkspaceHydration, downloadJobPdf } from "@/lib/workspace";
import type { WorkspaceHydration } from "@/lib/workspace";

interface WorkspaceV2ShellProps {
  jobId?: string;
  hydration?: WorkspaceHydration | null;
  initialPdfUrl?: string | null;
  mode?: "workspace" | "upload";
}

export function WorkspaceV2Shell({
  jobId,
  hydration,
  initialPdfUrl,
  mode = "workspace",
}: WorkspaceV2ShellProps) {
  const isUpload = mode === "upload";

  const {
    activeDetailTab,
    pdfUrl,
    viewMode,
    setViewMode,
    setJobId,
    setHydration,
    setPdfUrl,
    suggestionStatuses,
    applyAllSuggestions,
    hydration: storeHydration,
  } = useWorkspaceV2Store();

  const [isFooterExpanded, setIsFooterExpanded] = useState(true);
  const [isExportingOptimized, setIsExportingOptimized] = useState(false);
  const [isExportingReport, setIsExportingReport] = useState(false);

  const { statusMapRef } = useWorkspaceDoc(jobId ?? "");

  const isDetailFocus = activeDetailTab !== null;
  const isDiffActive = viewMode === "original";

  const allPending = (storeHydration?.suggestion_anchors ?? []).filter(
    (a) =>
      !suggestionStatuses[a.suggestion_id] ||
      suggestionStatuses[a.suggestion_id] === "pending",
  ).length;

  const handleApplyAll = useCallback(() => {
    applyAllSuggestions();
    const anchors = storeHydration?.suggestion_anchors ?? [];
    const statusMap = statusMapRef.current;
    if (statusMap) {
      anchors.forEach((anchor) => {
        const current = statusMap.get(anchor.suggestion_id);
        if (!current || current === "pending") {
          statusMap.set(anchor.suggestion_id, "applied");
        }
      });
    }
  }, [applyAllSuggestions, storeHydration, statusMapRef]);

  const handleExportOptimized = useCallback(async () => {
    if (!jobId || isExportingOptimized) {
      return;
    }
    setIsExportingOptimized(true);
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
      setIsExportingOptimized(false);
    }
  }, [jobId, isExportingOptimized]);

  const handleExportReport = useCallback(async () => {
    if (!jobId || isExportingReport) {
      return;
    }
    setIsExportingReport(true);
    toast("Preparing report download…");
    try {
      await downloadJobPdf(
        `/jobs/${jobId}/export/pdf`,
        "GET",
        `cv-analyze-${jobId.slice(0, 8)}.pdf`,
      );
      toast.success("Report downloaded successfully");
    } catch (error) {
      toast.error(
        `Report download failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsExportingReport(false);
    }
  }, [jobId, isExportingReport]);

  const fetchHydration = useCallback(async () => {
    if (!jobId) {
      return;
    }
    try {
      const data = await getWorkspaceHydration(jobId);
      if (data) {
        setHydration(data);
      }
    } catch {
      toast.error("Failed to load workspace data. Please refresh the page.");
    }
  }, [jobId, setHydration]);

  const fetchPdfUrl = useCallback(async () => {
    if (!jobId || pdfUrl) {
      return;
    }
    try {
      const proxyUrl = `/api/v1/jobs/${jobId}/file/proxy`;
      setPdfUrl(proxyUrl);
    } catch {
      /* PDF proxy URL assignment cannot fail */
    }
  }, [jobId, pdfUrl, setPdfUrl]);

  useEffect(() => {
    if (isUpload) {
      return;
    }
    if (jobId) {
      setJobId(jobId);
    }
    if (hydration) {
      setHydration(hydration);
    } else if (!storeHydration) {
      fetchHydration();
    }
    if (initialPdfUrl) {
      setPdfUrl(initialPdfUrl);
    } else {
      fetchPdfUrl();
    }
  }, [
    isUpload,
    jobId,
    hydration,
    initialPdfUrl,
    setJobId,
    setHydration,
    setPdfUrl,
    fetchPdfUrl,
    fetchHydration,
    storeHydration,
  ]);

  const gridStyle: CSSProperties = isUpload
    ? ({ "--ws-grid-cols": "210px minmax(0, 1.18fr) 280px" } as CSSProperties)
    : ({
        "--ws-grid-cols": isDetailFocus
          ? "minmax(480px, 1.08fr) 0px 280px"
          : "210px minmax(0, 1.18fr) 280px",
        transition: "grid-template-columns 250ms ease-in-out",
      } as CSSProperties);

  return (
    <div
      data-workspace-v2
      className="flex h-screen flex-col overflow-hidden text-[--ws-ink]"
      style={{
        background: "#F5F2D8",
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(17,17,17,0.11) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 90% 90% at 50% 50%, black 30%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 90% at 50% 50%, black 30%, transparent 100%)",
        }}
      />

      <WorkspaceV2Header
        filename={isUpload ? null : (hydration?.file.filename ?? null)}
        jobId={jobId ?? ""}
        jobStatus={isUpload ? undefined : hydration?.status}
        uploadMode={isUpload}
        className="relative z-10 flex-none"
      />

      <div
        className="ws-grid relative z-10 flex-1 overflow-hidden grid p-2 gap-2"
        style={gridStyle}
      >
        <aside
          className="hidden lg:flex flex-col overflow-hidden rounded-none border-y border-dashed border-white/15"
          style={{
            background: "#141414",
          }}
        >
          <LeftDetailPanel className="h-full" />
        </aside>

        <main
          className={cn(
            "relative flex flex-col overflow-hidden rounded-none",
            !isUpload && "transition-opacity duration-250 ease-in-out",
            !isUpload && isDetailFocus && "opacity-0 pointer-events-none",
          )}
          style={
            isUpload
              ? {
                  background: "#141414",
                  borderTop: "1px dashed rgba(255,255,255,0.15)",
                  borderBottom: "1px dashed rgba(255,255,255,0.15)",
                }
              : undefined
          }
          aria-hidden={!isUpload && isDetailFocus}
        >
          {isUpload ? <UploadPanel /> : <PdfViewerPanel pdfUrl={pdfUrl} />}
        </main>

        <aside
          className="hidden lg:flex flex-col overflow-hidden min-h-0 rounded-none border-y border-dashed border-white/15"
          style={{
            background: "#141414",
          }}
        >
          <ChatPanel className="h-full" />
        </aside>
      </div>

      {isUpload ? (
        <footer
          className="relative z-20 flex-none px-5 py-2.5"
          style={{
            background: "rgba(245,242,216,0.85)",
            borderTop: "1px dashed rgba(17,17,17,0.18)",
            boxShadow: "none",
          }}
        >
          <div className="flex justify-between items-center gap-3 w-full">
            <div className="flex items-center gap-1.5">
              <span
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-black"
                style={{
                  background: "rgba(17,17,17,0.05)",
                  border: "1px solid rgba(17,17,17,0.10)",
                  color: "#555",
                }}
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Upload a CV to get started</span>
              </span>
            </div>
            <div className="text-[10px] text-[#141414]/40 font-medium">
              PDF or DOCX · Max 5 MB
            </div>
          </div>
        </footer>
      ) : (
        <footer
          className={cn(
            "relative z-20 flex-none transition-all duration-300 ease-in-out px-5",
            isFooterExpanded
              ? "py-2.5 h-auto opacity-100"
              : "h-2 p-0 opacity-80 hover:h-4 group/footer",
          )}
          style={{
            background: "rgba(245,242,216,0.85)",
            borderTop: "1px dashed rgba(17,17,17,0.18)",
            boxShadow: isFooterExpanded ? "none" : "none",
          }}
          aria-label="Workspace actions"
        >
          <button
            onClick={() => setIsFooterExpanded(!isFooterExpanded)}
            className={cn(
              "absolute left-1/2 -top-4 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full border bg-[#F5F2D8] text-[#141414] shadow-sm transition-all hover:scale-110 active:scale-95 z-30",
              !isFooterExpanded && "opacity-0 group-hover/footer:opacity-100",
            )}
            style={{
              borderColor: "rgba(17,17,17,0.12)",
            }}
          >
            {isFooterExpanded ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronUp size={14} />
            )}
          </button>

          {isFooterExpanded && (
            <div className="flex flex-wrap justify-between items-center gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleApplyAll}
                  disabled={allPending === 0}
                  className="group flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-black tracking-wide transition-all duration-150 hover:brightness-95 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background:
                      allPending > 0
                        ? "rgba(202,255,67,0.25)"
                        : "rgba(17,17,17,0.05)",
                    border:
                      allPending > 0
                        ? "1px solid rgba(202,255,67,0.45)"
                        : "1px solid rgba(17,17,17,0.10)",
                    color: allPending > 0 ? "#2a4200" : "#555",
                  }}
                >
                  <Wand2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Apply all suggestions</span>
                  {allPending > 0 && (
                    <span
                      className="flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] font-black"
                      style={{ background: "#CAFF43", color: "#1a2900" }}
                    >
                      {allPending}
                    </span>
                  )}
                </button>

                <div
                  className="h-4 w-px bg-[rgba(17,17,17,0.15)] mx-1"
                  aria-hidden="true"
                />

                <button
                  type="button"
                  onClick={() =>
                    setViewMode(isDiffActive ? "optimized" : "original")
                  }
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-black tracking-wide transition-all duration-150 hover:brightness-95 active:scale-[0.97]"
                  style={{
                    background: isDiffActive
                      ? "rgba(246,122,223,0.18)"
                      : "rgba(17,17,17,0.05)",
                    border: isDiffActive
                      ? "1px solid rgba(246,122,223,0.38)"
                      : "1px solid rgba(17,17,17,0.10)",
                    color: isDiffActive ? "#6b0050" : "#333333",
                  }}
                  aria-pressed={isDiffActive}
                >
                  <GitCompare className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Comparison View</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider"
                    style={{
                      background: isDiffActive
                        ? "rgba(246,122,223,0.15)"
                        : "rgba(17,17,17,0.06)",
                      border: "1px solid rgba(17,17,17,0.07)",
                      color: isDiffActive ? "#6b0050" : "#555",
                      minWidth: 56,
                      textAlign: "center" as const,
                    }}
                  >
                    {isDiffActive ? "Original" : "Optimized"}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleExportOptimized}
                  disabled={isExportingOptimized}
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-black tracking-wide transition-all duration-150 hover:brightness-95 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "rgba(255,140,66,0.15)",
                    border: "1px solid rgba(255,140,66,0.35)",
                    color: "#6b2d00",
                  }}
                >
                  {isExportingOptimized ? (
                    <Loader2
                      className="h-3.5 w-3.5 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  Export PDF
                </button>

                <button
                  type="button"
                  onClick={handleExportReport}
                  disabled={isExportingReport}
                  className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-black tracking-wide transition-all duration-150 hover:bg-[rgba(17,17,17,0.08)] active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "rgba(17,17,17,0.05)",
                    border: "1px solid rgba(17,17,17,0.11)",
                    color: "#333333",
                  }}
                >
                  {isExportingReport ? (
                    <Loader2
                      className="h-3.5 w-3.5 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  Export Report
                </button>
              </div>
            </div>
          )}
        </footer>
      )}
    </div>
  );
}
