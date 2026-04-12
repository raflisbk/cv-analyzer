"use client";
/**
 * PdfViewerInner — iframe-based PDF viewer.
 * Uses native browser PDF rendering to avoid pdfjs-dist Webpack bundling issues.
 * Supports page navigation via URL fragment (#page=N).
 * Phase 13: basic viewer. Annotation overlays added in Phase 14.
 */
import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PdfViewerInnerProps {
  url: string;
  containerWidth: number;
  /** Placeholder — kept for API compatibility with Phase 14 annotation spike */
  onPageLoadSuccess?: (page: unknown) => void;
}

export default function PdfViewerInner({
  url,
  containerWidth,
}: PdfViewerInnerProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Attempt to read total pages from iframe PDF (best-effort, may not work in all browsers)
  const handleIframeLoad = useCallback(
    (e: React.SyntheticEvent<HTMLIFrameElement>) => {
      try {
        const doc = (e.target as HTMLIFrameElement).contentDocument;
        if (doc) {
          // Some browsers expose page count via pdf.js embedded viewer
          // Falls back to unknown — navigation still works via #page= fragment
          setTotalPages(0);
        }
      } catch {
        // Cross-origin iframes block contentDocument access — expected for R2 URLs
      }
    },
    []
  );

  const iframeSrc = currentPage > 1 ? `${url}#page=${currentPage}` : url;

  const height = Math.round(containerWidth * 1.414); // A4 ratio

  return (
    <div className="flex flex-col">
      {/* Compact page navigation toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[rgba(17,17,17,0.04)]">
        <span className="text-xs font-bold text-[rgba(17,17,17,0.6)]">
          {totalPages > 0
            ? `Halaman ${currentPage} / ${totalPages}`
            : `Halaman ${currentPage}`}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            aria-label="Sebelumnya"
            className="flex h-7 w-7 items-center justify-center rounded text-xs text-[rgba(17,17,17,0.6)] hover:bg-[rgba(17,17,17,0.06)] disabled:opacity-30"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() =>
              setCurrentPage((p) =>
                totalPages > 0 ? Math.min(totalPages, p + 1) : p + 1
              )
            }
            aria-label="Berikutnya"
            className="flex h-7 w-7 items-center justify-center rounded text-xs text-[rgba(17,17,17,0.6)] hover:bg-[rgba(17,17,17,0.06)] disabled:opacity-30"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Native browser PDF iframe */}
      <iframe
        key={iframeSrc}
        src={iframeSrc}
        onLoad={handleIframeLoad}
        title="CV Preview"
        width={containerWidth}
        height={height}
        className="border-0 block"
        style={{ minHeight: 1080, width: containerWidth }}
      />
    </div>
  );
}
