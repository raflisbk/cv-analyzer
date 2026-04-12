"use client";
/**
 * PdfViewerInner - react-pdf canvas viewer with text layer.
 * Phase 14: Replaces the Phase 13 browser-native viewer. Enables customTextRenderer for annotation highlights.
 * Must be loaded via dynamic() with ssr: false (done in pdf-viewer.tsx).
 *
 * Worker setup: pdfjs.GlobalWorkerOptions.workerSrc must be set at module level BEFORE
 * Document renders. We use the versioned worker copied to /public.
 *
 * containerWidth + currentPage are controlled externally by PdfViewerPanel (unchanged API).
 */
import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import type { PageProps } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

// Derive CustomTextRenderer from PageProps so we don't rely on a non-exported type
type CustomTextRenderer = NonNullable<PageProps["customTextRenderer"]>;

// Must be set at module level before any Document renders
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PdfViewerInnerProps {
  url: string;
  containerWidth: number;
  currentPage?: number;
  onPageLoadSuccess?: (page: unknown) => void;
}

function PageLoadingSkeleton({ width }: { width: number }) {
  const height = Math.round(width * 1.414);
  return (
    <div
      className="animate-pulse bg-[rgba(17,17,17,0.06)]"
      style={{ width, height }}
      aria-label="Loading PDF page..."
    />
  );
}

export default function PdfViewerInner({
  url,
  containerWidth,
  currentPage = 1,
  onPageLoadSuccess,
}: PdfViewerInnerProps) {
  // _numPages: tracks total page count; used by Phase 14-03 for page boundary checks
  const [_numPages, setNumPages] = useState<number>(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  // customTextRenderer stub - Phase 14-03 will extend this with anchor-based highlights.
  // Must be wrapped in useCallback with stable deps to avoid infinite re-renders.
  const customTextRenderer: CustomTextRenderer = useCallback(
    ({ str }) => str,  // identity - no highlights yet; 14-03 injects colored spans
    []
  );

  if (loadError) {
    return (
      <div
        className="flex items-center justify-center bg-[rgba(17,17,17,0.04)]"
        style={{ width: containerWidth, height: Math.round(containerWidth * 1.414) }}
        role="alert"
      >
        <p className="text-sm text-[rgba(17,17,17,0.45)] text-center max-w-[280px]">
          Could not load PDF. Please try refreshing.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <Document
        file={url}
        onLoadSuccess={({ numPages: n }) => setNumPages(n)}
        onLoadError={(err) => setLoadError(err.message)}
        loading={<PageLoadingSkeleton width={containerWidth} />}
        error={null}
      >
        {containerWidth > 0 && (
          <Page
            pageNumber={currentPage}
            width={containerWidth}
            renderTextLayer={true}
            renderAnnotationLayer={false}
            customTextRenderer={customTextRenderer}
            loading={<PageLoadingSkeleton width={containerWidth} />}
            onLoadSuccess={(page) => {
              if (onPageLoadSuccess) {
                onPageLoadSuccess(page);
              }
            }}
          />
        )}
      </Document>
    </div>
  );
}