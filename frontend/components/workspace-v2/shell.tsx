"use client";
import { useEffect, useCallback, useState, type CSSProperties } from "react";
import { Wand2, GitCompare, Download, FileText, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWorkspaceV2Store } from "@/lib/stores/workspace-v2-store";
import { useWorkspaceDoc } from "@/hooks/use-workspace-doc";
import { WorkspaceV2Header } from "./header";
import { LeftDetailPanel } from "./left-detail-panel";
import { PdfViewerPanel } from "./pdf-viewer-panel";
import { ChatPanel } from "./chat-panel";
import { getWorkspaceHydration } from "@/lib/workspace";
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
  const { activeDetailTab, pdfUrl, viewMode, setViewMode, setJobId, setHydration, setPdfUrl,
    suggestionStatuses, applyAllSuggestions, hydration: storeHydration } =
    useWorkspaceV2Store();
  
  const [isFooterExpanded, setIsFooterExpanded] = useState(true);

  const { statusMapRef } = useWorkspaceDoc(jobId);

  const isDetailFocus = activeDetailTab !== null;
  const isDiffActive = viewMode === "original";

  const allPending = (storeHydration?.suggestion_anchors ?? []).filter(
    (a) => !suggestionStatuses[a.suggestion_id] || suggestionStatuses[a.suggestion_id] === "pending"
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

  // Fetch hydration data client-side to avoid SSR network issues
  const fetchHydration = useCallback(async () => {
    try {
      console.warn('[Shell] Fetching hydration for job:', jobId);
      const data = await getWorkspaceHydration(jobId);
      console.warn('[Shell] Hydration fetched:', {
        jobId,
        hasData: !!data,
        anchorCount: data?.suggestion_anchors?.length ?? 0,
      });
      if (data) {
        setHydration(data);
      }
    } catch (error) {
      console.error('[Shell] Failed to fetch hydration:', error);
    }
  }, [jobId, setHydration]);

  // Fetch pdfUrl client-side so it's visible in DevTools and not dependent on SSR
  const fetchPdfUrl = useCallback(async () => {
    if (pdfUrl) { return; }
    try {
      // Use proxy endpoint to avoid CORS issues with R2 presigned URLs
      const proxyUrl = `/api/v1/jobs/${jobId}/file/proxy`;
      setPdfUrl(proxyUrl);
    } catch {
      // silently fail — PDF viewer shows error state
    }
  }, [jobId, pdfUrl, setPdfUrl]);

  useEffect(() => {
    console.warn('[Shell] Hydration received:', {
      jobId,
      hasHydration: !!hydration,
      anchorCount: hydration?.suggestion_anchors?.length ?? 0,
      hasStoreHydration: !!storeHydration,
    });
    setJobId(jobId);
    if (hydration) {
      console.warn('[Shell] Setting hydration with anchors:', hydration.suggestion_anchors);
      setHydration(hydration);
    } else if (!storeHydration) {
      // Only fetch if we don't have hydration from props AND don't have it in store yet
      console.warn('[Shell] No hydration from props or store, fetching...');
      fetchHydration();
    }
    if (initialPdfUrl) {
      setPdfUrl(initialPdfUrl);
    } else {
      fetchPdfUrl();
    }
  }, [jobId, hydration, initialPdfUrl, setJobId, setHydration, setPdfUrl, fetchPdfUrl, fetchHydration, storeHydration]);

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

      {/* Frosted glass floating panels — depth layer */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Large frosted orb — top left */}
        <div
          style={{
            position: "absolute", top: "-80px", left: "-60px",
            width: 400, height: 400, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(202,255,67,0.09) 0%, transparent 68%)",
            filter: "blur(32px)",
          }}
        />
        {/* Medium orb — bottom right */}
        <div
          style={{
            position: "absolute", bottom: "-60px", right: "-40px",
            width: 320, height: 320, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(246,122,223,0.08) 0%, transparent 68%)",
            filter: "blur(28px)",
          }}
        />
        {/* Thin glass card — floats in the center-right quadrant */}
        <div
          style={{
            position: "absolute", top: "30%", right: "22%",
            width: 180, height: 260, borderRadius: 24,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.14)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            transform: "rotate(6deg)",
          }}
        />
        {/* Small accent ring — center-left */}
        <div
          style={{
            position: "absolute", top: "55%", left: "15%",
            width: 96, height: 96, borderRadius: "50%",
            border: "1.5px solid rgba(202,255,67,0.22)",
          }}
        />
        {/* Lime smear glow — center */}
        <div
          style={{
            position: "absolute", top: "40%", left: "45%",
            width: 260, height: 120, borderRadius: "50%",
            background: "rgba(202,255,67,0.055)",
            filter: "blur(40px)",
          }}
        />
      </div>

      {/* Header — masthead style, height auto */}
      <WorkspaceV2Header
        filename={hydration?.file.filename ?? null}
        jobId={jobId}
        jobStatus={hydration?.status}
        className="relative z-10 flex-none"
      />

      {/* Body — 3-panel grid with padding so panels float */}
      <div
        className="relative z-10 flex-1 overflow-hidden grid p-2 gap-2"
        style={gridStyle}
      >
        {/* Left detail panel — floating warm-dark card */}
        <aside
          className="hidden lg:flex flex-col overflow-hidden rounded-2xl"
          style={{
            background: "linear-gradient(160deg, #201C14 0%, #1A170F 55%, #16130C 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 4px 32px rgba(0,0,0,0.22), 0 1px 0 rgba(255,255,255,0.04) inset",
          }}
        >
          <LeftDetailPanel className="h-full" />
        </aside>

        {/* Center PDF panel — hidden when detail-focus is active */}
        <main
          className={cn(
            "relative flex flex-col overflow-hidden rounded-2xl",
            "transition-opacity duration-250 ease-in-out",
            isDetailFocus && "opacity-0 pointer-events-none"
          )}
          aria-hidden={isDetailFocus}
        >
          <PdfViewerPanel pdfUrl={pdfUrl} />
        </main>

        {/* Right rail — floating warm-dark card */}
        <aside
          className="hidden lg:flex flex-col overflow-hidden min-h-0 rounded-2xl"
          style={{
            background: "linear-gradient(160deg, #201C14 0%, #1A170F 55%, #16130C 100%)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 4px 32px rgba(0,0,0,0.22), 0 1px 0 rgba(255,255,255,0.04) inset",
          }}
        >
          <ChatPanel className="h-full" />
        </aside>
      </div>

      {/* Action footer — frosted light bar */}
      <footer
        className={cn(
          "relative z-20 flex-none transition-all duration-300 ease-in-out px-5",
          isFooterExpanded ? "py-2.5 h-auto opacity-100" : "h-2 p-0 opacity-80 hover:h-4 group/footer"
        )}
        style={{
          background: "rgba(245,242,216,0.85)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderTop: "1px solid rgba(17,17,17,0.1)",
          boxShadow: isFooterExpanded 
            ? "0 -4px 24px rgba(17,17,17,0.06), inset 0 1px 0 rgba(255,255,255,0.70)"
            : "0 -2px 10px rgba(17,17,17,0.03)",
        }}
        aria-label="Workspace actions"
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsFooterExpanded(!isFooterExpanded)}
          className={cn(
            "absolute left-1/2 -top-4 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full border bg-[#F5F2D8] text-[#141414] shadow-sm transition-all hover:scale-110 active:scale-95 z-30",
            !isFooterExpanded && "opacity-0 group-hover/footer:opacity-100"
          )}
          style={{
            borderColor: "rgba(17,17,17,0.12)",
          }}
        >
          {isFooterExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>

        {isFooterExpanded && (
          <div className="flex justify-between items-center gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Left group: Apply + Diff */}
            <div className="flex items-center gap-1.5">
              {/* Apply all */}
              <button
                type="button"
                onClick={handleApplyAll}
                disabled={allPending === 0}
                className="group flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-black tracking-wide transition-all duration-150 hover:brightness-95 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: allPending > 0 ? "rgba(202,255,67,0.25)" : "rgba(17,17,17,0.05)",
                  border: allPending > 0 ? "1px solid rgba(202,255,67,0.45)" : "1px solid rgba(17,17,17,0.10)",
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

              {/* Visual separator */}
              <div className="h-4 w-px bg-[rgba(17,17,17,0.15)] mx-1" aria-hidden="true" />

              {/* Diff toggle */}
              <button
                type="button"
                onClick={() => setViewMode(isDiffActive ? "optimized" : "original")}
                className="flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-black tracking-wide transition-all duration-150 hover:brightness-95 active:scale-[0.97]"
                style={{
                  background: isDiffActive ? "rgba(246,122,223,0.18)" : "rgba(17,17,17,0.05)",
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
                    background: isDiffActive ? "rgba(246,122,223,0.15)" : "rgba(17,17,17,0.06)",
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

            {/* Right group: Save actions */}
            <div className="flex items-center gap-1.5">
              {/* Save optimized PDF */}
              <button
                type="button"
                className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-black tracking-wide transition-all duration-150 hover:brightness-95 active:scale-[0.97]"
                style={{
                  background: "rgba(255,140,66,0.15)",
                  border: "1px solid rgba(255,140,66,0.35)",
                  color: "#6b2d00",
                }}
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Export PDF
              </button>

              {/* Save report */}
              <button
                type="button"
                className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-black tracking-wide transition-all duration-150 hover:bg-[rgba(17,17,17,0.08)] active:scale-[0.97]"
                style={{
                  background: "rgba(17,17,17,0.05)",
                  border: "1px solid rgba(17,17,17,0.11)",
                  color: "#333333",
                }}
              >
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                Export Report
              </button>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}
