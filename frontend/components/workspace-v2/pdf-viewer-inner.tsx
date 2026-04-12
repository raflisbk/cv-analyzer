"use client";
/**
 * PdfViewerInner — iframe-based PDF viewer.
 * Uses native browser PDF rendering to avoid pdfjs-dist Webpack bundling issues.
 * Supports page navigation via URL fragment (#page=N).
 * Light-theme toolbar to match workspace cream palette.
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

  const handleIframeLoad = useCallback(
    (_e: React.SyntheticEvent<HTMLIFrameElement>) => {
      // Cross-origin R2 iframes block contentDocument — page count unavailable
    },
    []
  );

  const iframeSrc = currentPage > 1 ? `${url}#page=${currentPage}` : url;
  const height = Math.round(containerWidth * 1.414); // A4 ratio

  return (
    <div className="flex flex-col">
      {/* Document toolbar — light theme, inside paper card */}
      <div className="flex items-center justify-between border-b border-[rgba(17,17,17,0.06)] px-4 py-2 bg-[rgba(17,17,17,0.02)]">
        <span className="text-xs font-semibold text-[rgba(17,17,17,0.45)]">
          Page {currentPage}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-xs text-[rgba(17,17,17,0.5)] hover:bg-[rgba(17,17,17,0.06)] disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            aria-label="Next page"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-xs text-[rgba(17,17,17,0.5)] hover:bg-[rgba(17,17,17,0.06)] disabled:opacity-30 transition-colors"
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
        title="CV Document Preview"
        width={containerWidth}
        height={height}
        className="border-0 block"
        style={{ minHeight: 1080, width: containerWidth }}
      />
    </div>
  );
}
