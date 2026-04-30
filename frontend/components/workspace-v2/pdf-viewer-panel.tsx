"use client";
/**
 * PdfViewerPanel — Mathical-style outer container for the PDF viewer.
 * Dark hero-card banner (matching landing page hero card: #141414 + accent dots + cream text)
 * sits above the cream paper card. Page navigation and view mode live in the banner.
 * Ambient decorative dots float in the cream scroll area background.
 * Phase 17: Added toggle between Edit Mode (Tiptap) and Preview Mode (PDF canvas).
 */
import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Plus, Minus, Maximize2 } from "lucide-react";
import { PdfViewer } from "./pdf-viewer";
import { useWorkspaceV2Store } from "@/lib/stores/workspace-v2-store";

interface PdfViewerPanelProps {
  pdfUrl: string | null;
  onPageLoadSuccess?: (page: unknown) => void;
}

export function PdfViewerPanel({ pdfUrl, onPageLoadSuccess }: PdfViewerPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.0);

  const { hydration, viewMode } = useWorkspaceV2Store();
  const filename = hydration?.file.filename ?? "document.pdf";
  const anchors = hydration?.suggestion_anchors ?? [];
  const suggestions = hydration?.analysis?.suggestions ?? [];
  const jobId = hydration?.job_id ?? "";
  const modeLabel = viewMode === "optimized" ? "Optimized" : "Original Uploaded";
  const modeNote = viewMode === "original"
    ? "Optimized PDF available after edits applied"
    : null;

  useEffect(() => {
    if (!containerRef.current) { return; }
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      setContainerWidth(Math.floor(width));
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Handle wheel event for zoom with Ctrl key
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale((s) => Math.max(0.5, Math.min(3.0, s + delta)));
    }
  }, []);

  // Native wheel listener to prevent browser zoom on the PDF panel
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) { return; }
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setScale((s) => Math.max(0.5, Math.min(3.0, s + delta)));
      }
    };
    el.addEventListener("wheel", handler, { passive: false });
    return () => el.removeEventListener("wheel", handler);
  }, []);

  return (
    <div ref={scrollContainerRef} className="relative flex-1 overflow-y-auto bg-[--ws-bg]">

      {/* Layered background decoration — arcs + blurred orbs + cross-hatch */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {/* Large frosted arc behind viewer */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: 640, height: 640,
            borderRadius: "50%",
            border: "1.5px solid rgba(17,17,17,0.055)",
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            width: 440, height: 440,
            borderRadius: "50%",
            border: "1px solid rgba(17,17,17,0.04)",
          }}
        />
        {/* Blurred colour orbs */}
        <div className="absolute top-8 right-10 h-4 w-4 rounded-full bg-[#CAFF43] opacity-50" />
        <div className="absolute top-16 right-24 h-2.5 w-2.5 rounded-full bg-[#FF4FCB] opacity-38" />
        <div className="absolute top-5 right-44 h-7 w-7 rounded-full bg-[#FF8C42] opacity-22" />
        <div className="absolute bottom-20 left-5 h-3.5 w-3.5 rounded-full bg-[#8B5CF6] opacity-30" />
        <div className="absolute top-1/3 right-6 h-2 w-2 rounded-full bg-[#CAFF43] opacity-28" />
        <div
          className="absolute bottom-32 right-1/4"
          style={{
            width: 120, height: 120, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(202,255,67,0.12) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-24 left-1/4"
          style={{
            width: 90, height: 90, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(246,122,223,0.10) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Document area */}
      <div className="relative mx-auto max-w-[820px] px-6 py-8">

        {/* ── Dark hero-card banner — same visual language as landing page hero ── */}
        <div className="relative overflow-hidden rounded-t-2xl bg-[#141414] px-5 py-3.5 flex items-center justify-between">
          {/* Decorative dots inside banner */}
          <div aria-hidden="true" className="absolute right-5 top-2 h-3 w-3 rounded-full bg-[#CAFF43] opacity-72" />
          <div aria-hidden="true" className="absolute right-12 top-5 h-1.5 w-1.5 rounded-full bg-[#FF4FCB] opacity-55" />
          <div aria-hidden="true" className="absolute right-20 top-1 h-5 w-5 rounded-full bg-[#FF8C42] opacity-32" />
          <div aria-hidden="true" className="absolute bottom-1 right-4 h-1.5 w-1.5 rounded-full bg-[#8B5CF6] opacity-42" />

          {/* Filename + view mode */}
          <div className="min-w-0 flex-1 pr-4">
            <p className="font-display text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#F5F2D8]/35">
              path karir / cv analysis
            </p>
            <p className="font-display mt-0.5 truncate text-[13px] font-bold text-[#F5F2D8]">
              <span
                className="rounded-full px-[0.45em] py-[0.08em] mr-1.5"
                style={{ background: "rgba(255,255,255,0.10)", color: "#F5F2D8" }}
              >
                Document
              </span>
              <span style={{ color: "#CAFF43" }}>{modeLabel}</span>
              <span className="ml-2 text-[#F5F2D8]/35 text-[11px] font-normal truncate">{filename}</span>
            </p>
            {modeNote && (
              <p className="mt-0.5 text-[9px] text-[#F5F2D8]/30 truncate font-normal">
                {modeNote}
              </p>
            )}
          </div>

          {/* Mode Toggle + Page navigation + Zoom controls */}
          <div className="flex flex-none items-center gap-2">
            {/* Zoom controls - only show in preview mode */}
            <div className="flex items-center gap-1 border-r border-white/10 pr-2 mr-1">
              <button
                onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
                aria-label="Zoom out"
                className="flex h-6 w-6 items-center justify-center rounded text-[#F5F2D8]/60 hover:bg-white/10 hover:text-[#F5F2D8] transition-colors"
              >
                <Minus className="h-3 w-3" />
              </button>
              <button
                onClick={() => setScale(1.0)}
                aria-label="Fit to width"
                className="flex h-6 w-6 items-center justify-center rounded text-[#F5F2D8]/60 hover:bg-white/10 hover:text-[#F5F2D8] transition-colors"
              >
                <Maximize2 className="h-3 w-3" />
              </button>
              <button
                onClick={() => setScale((s) => Math.min(3.0, s + 0.1))}
                aria-label="Zoom in"
                className="flex h-6 w-6 items-center justify-center rounded text-[#F5F2D8]/60 hover:bg-white/10 hover:text-[#F5F2D8] transition-colors"
              >
                <Plus className="h-3 w-3" />
              </button>
              <span className="text-[10px] text-[#F5F2D8]/40 min-w-[2.5rem] text-center">
                {Math.round(scale * 100)}%
              </span>
            </div>

            {/* Page navigation - only show in preview mode */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                aria-label="Previous page"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[#F5F2D8]/60 hover:bg-white/10 hover:text-[#F5F2D8] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="min-w-[3rem] text-center text-[11px] font-bold text-[#F5F2D8]/55">
                {currentPage}{numPages > 0 && ` / ${numPages}`}
              </span>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!pdfUrl || (numPages > 0 && currentPage >= numPages)}
                aria-label="Next page"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-[#F5F2D8]/60 hover:bg-white/10 hover:text-[#F5F2D8] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Cream paper card — flush below banner ── */}
        <div
          ref={containerRef}
          className="overflow-hidden rounded-b-2xl border-b border-x border-[rgba(17,17,17,0.06)] bg-[#FFFDF4] shadow-[0_12px_48px_rgba(17,17,17,0.10),0_2px_6px_rgba(17,17,17,0.05)]"
          aria-label="Document Editor"
        >
          <PdfViewer
            url={pdfUrl}
            containerWidth={containerWidth}
            currentPage={currentPage}
            scale={scale}
            onPageLoadSuccess={onPageLoadSuccess}
            onDocumentLoadSuccess={setNumPages}
            anchors={anchors}
            suggestions={suggestions}
            jobId={jobId}
          />
        </div>

      </div>
    </div>
  );
}


