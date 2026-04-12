"use client";
/**
 * PdfViewerPanel — Mathical-style outer container for the PDF viewer.
 * Dark hero-card banner (matching landing page hero card: #141414 + accent dots + cream text)
 * sits above the cream paper card. Page navigation and view mode live in the banner.
 * Ambient decorative dots float in the cream scroll area background.
 */
import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

  const { hydration, viewMode } = useWorkspaceV2Store();
  const filename = hydration?.file.filename ?? "document.pdf";
  const modeLabel = viewMode === "optimized" ? "Optimized" : "Original";

  useEffect(() => {
    if (!containerRef.current) { return; }
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      setContainerWidth(Math.floor(width));
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative flex-1 overflow-y-auto bg-[--ws-bg]">

      {/* Ambient decorative dots in the cream scroll area — aria-hidden */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-8 right-10 h-4 w-4 rounded-full bg-[#CAFF43] opacity-50" />
        <div className="absolute top-16 right-24 h-2.5 w-2.5 rounded-full bg-[#FF4FCB] opacity-38" />
        <div className="absolute top-5 right-44 h-7 w-7 rounded-full bg-[#FF8C42] opacity-22" />
        <div className="absolute bottom-20 left-5 h-3.5 w-3.5 rounded-full bg-[#8B5CF6] opacity-30" />
        <div className="absolute top-1/3 right-6 h-2 w-2 rounded-full bg-[#CAFF43] opacity-28" />
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
              pathkr / cv analysis
            </p>
            <p className="font-display mt-0.5 truncate text-[13px] font-bold text-[#F5F2D8]">
              {filename}
              <span className="ml-2 text-[#CAFF43]">— {modeLabel}</span>
            </p>
          </div>

          {/* Page navigation */}
          <div className="flex flex-none items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              aria-label="Previous page"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#F5F2D8]/60 hover:bg-white/10 hover:text-[#F5F2D8] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="min-w-[1.6rem] text-center text-[11px] font-bold text-[#F5F2D8]/55">
              {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={!pdfUrl}
              aria-label="Next page"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#F5F2D8]/60 hover:bg-white/10 hover:text-[#F5F2D8] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ── Cream paper card — flush below banner ── */}
        <div
          ref={containerRef}
          className="overflow-hidden rounded-b-2xl border-b border-x border-[rgba(17,17,17,0.06)] bg-[#FFFDF4] shadow-[0_12px_48px_rgba(17,17,17,0.10),0_2px_6px_rgba(17,17,17,0.05)]"
          aria-label="PDF Document"
        >
          <PdfViewer
            url={pdfUrl}
            containerWidth={containerWidth}
            currentPage={currentPage}
            onPageLoadSuccess={onPageLoadSuccess}
          />
        </div>

      </div>
    </div>
  );
}


