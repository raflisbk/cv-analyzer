"use client";
/**
 * PdfViewerPanel — outer container untuk PDF viewer.
 * ResizeObserver mengukur container width dan meneruskan ke PdfViewer.
 * Menampilkan PDF paper (cream #FFFDF4) floating di dark shell (#111111).
 */
import { useRef, useState, useEffect } from "react";
import { PdfViewer } from "./pdf-viewer";

interface PdfViewerPanelProps {
  pdfUrl: string | null;
  onPageLoadSuccess?: (page: unknown) => void;
}

export function PdfViewerPanel({ pdfUrl, onPageLoadSuccess }: PdfViewerPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

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
    // Dark shell outer — bg #111111, padding p-6, scroll the PDF
    <div className="flex-1 overflow-y-auto bg-[--ws-bg] p-6">
      {/* Paper container — cream #FFFDF4, max-w 860px, shadow, rounded */}
      <div
        ref={containerRef}
        className="
          mx-auto max-w-[860px] min-h-[1080px]
          rounded-2xl
          bg-[#FFFDF4]
          border border-[rgba(202,255,67,0.08)]
          shadow-[0_8px_48px_rgba(0,0,0,0.65)]
          overflow-hidden
        "
        aria-label="Dokumen PDF"
      >
        <PdfViewer
          url={pdfUrl}
          containerWidth={containerWidth}
          onPageLoadSuccess={onPageLoadSuccess}
        />
      </div>
      {/* Loading copy di bawah paper */}
      {!pdfUrl && (
        <p className="mt-4 text-center text-sm text-[--ws-ink-secondary]">
          Memuat dokumen...
        </p>
      )}
    </div>
  );
}
