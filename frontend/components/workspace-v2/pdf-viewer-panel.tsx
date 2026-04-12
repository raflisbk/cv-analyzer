"use client";
/**
 * PdfViewerPanel — Mathical-style outer container for the PDF viewer.
 * Cream outer bg + decorative colored dots matching landing page hero section.
 * Premium paper card presentation with editorial document header.
 */
import { useRef, useState, useEffect } from "react";
import { PdfViewer } from "./pdf-viewer";
import { useWorkspaceV2Store } from "@/lib/stores/workspace-v2-store";
import { AccentPill } from "@/components/ui/accent-pill";

interface PdfViewerPanelProps {
  pdfUrl: string | null;
  onPageLoadSuccess?: (page: unknown) => void;
}

export function PdfViewerPanel({ pdfUrl, onPageLoadSuccess }: PdfViewerPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const { hydration, viewMode } = useWorkspaceV2Store();

  useEffect(() => {
    if (!containerRef.current) { return; }
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      setContainerWidth(Math.floor(width));
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const filename = hydration?.file.filename ?? "document.pdf";

  return (
    // Cream outer — matches landing page body background
    <div className="relative flex-1 overflow-y-auto bg-[--ws-bg]">

      {/* Decorative ambient dots — same pattern as hero section (aria-hidden) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-8 right-10 h-4 w-4 rounded-full bg-[#CAFF43] opacity-55" />
        <div className="absolute top-16 right-24 h-2.5 w-2.5 rounded-full bg-[#FF4FCB] opacity-40" />
        <div className="absolute top-5 right-44 h-7 w-7 rounded-full bg-[#FF8C42] opacity-25" />
        <div className="absolute bottom-20 left-5 h-3.5 w-3.5 rounded-full bg-[#8B5CF6] opacity-35" />
        <div className="absolute bottom-10 left-16 h-5 w-5 rounded-full bg-[#141414] opacity-08" />
        <div className="absolute top-1/3 right-6 h-2 w-2 rounded-full bg-[#CAFF43] opacity-30" />
      </div>

      {/* Document area */}
      <div className="relative mx-auto max-w-[820px] px-6 py-8">

        {/* Editorial document header — label above the paper */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-display text-[11px] font-extrabold uppercase tracking-[0.14em] text-[rgba(17,17,17,0.4)]">
              CV
            </span>
            <AccentPill color="pink" size="sm">Preview</AccentPill>
            <span className="h-1 w-1 rounded-full bg-[rgba(17,17,17,0.25)]" />
            <span className="truncate text-[11px] font-medium text-[rgba(17,17,17,0.45)] max-w-[220px]">
              {filename}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={
                viewMode === "optimized"
                  ? "rounded-full bg-[#CAFF43] px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#141414]"
                  : "rounded-full border border-[rgba(17,17,17,0.14)] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[rgba(17,17,17,0.5)]"
              }
            >
              {viewMode === "optimized" ? "Optimized" : "Original"}
            </span>
          </div>
        </div>

        {/* Paper card — cream, rounded, editorial shadow */}
        <div
          ref={containerRef}
          className="overflow-hidden rounded-3xl border border-[rgba(17,17,17,0.06)] bg-[#FFFDF4] shadow-[0_12px_60px_rgba(17,17,17,0.12),0_2px_8px_rgba(17,17,17,0.06)]"
          aria-label="PDF Document"
        >
          <PdfViewer
            url={pdfUrl}
            containerWidth={containerWidth}
            onPageLoadSuccess={onPageLoadSuccess}
          />
        </div>

        {/* Loading state */}
        {!pdfUrl && (
          <div className="mt-6 text-center">
            <p className="text-sm font-medium text-[rgba(17,17,17,0.4)]">
              Loading document…
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
