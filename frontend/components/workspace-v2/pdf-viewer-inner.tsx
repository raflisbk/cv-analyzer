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
import { useWorkspaceV2Store } from "@/lib/stores/workspace-v2-store";
import { AnnotationOverlay } from "./annotation-overlay";
import type { SuggestionAnchorRecord } from "@/lib/workspace";

// Derive CustomTextRenderer from PageProps so we don't rely on a non-exported type
type CustomTextRenderer = NonNullable<PageProps["customTextRenderer"]>;

// Must be set at module level before any Document renders
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

function priorityToColor(priority: string): { bg: string; border: string } {
  const map: Record<string, { bg: string; border: string }> = {
    high_impact: { bg: "rgba(239,68,68,0.25)", border: "rgba(239,68,68,0.7)" },
    quick_win: { bg: "rgba(245,158,11,0.25)", border: "rgba(245,158,11,0.7)" },
  };
  return map[priority] ?? map["quick_win"];
}

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
  const [pageWidth, setPageWidth] = useState<number>(595.5);

  const anchors = useWorkspaceV2Store(
    (s) => (s.hydration?.suggestion_anchors ?? []) as SuggestionAnchorRecord[]
  );

  const handleApply = useCallback((_id: string) => {
    // Phase 14-04: will wire to setSuggestionStatus(id, "applied")
  }, []);

  const handleDismiss = useCallback((_id: string) => {
    // Phase 14-04: will wire to setSuggestionStatus(id, "dismissed")
  }, []);

  // customTextRenderer — injects colored <span> highlights for each anchor match.
  // Must be wrapped in useCallback with stable deps to avoid infinite re-renders.
  const customTextRenderer: CustomTextRenderer = useCallback(
    ({ str, pageIndex }) => {
      if (!str.trim() || str.trim().length <= 2) { return str; }

      const match = anchors.find(
        (a) =>
          a.page_index === pageIndex &&
          a.text_anchor.toLowerCase().includes(str.toLowerCase().trim())
      );
      if (!match) { return str; }

      const color = priorityToColor(match.priority);
      return `<span
        class="annot-hl"
        data-sid="${match.suggestion_id}"
        style="background:${color.bg};border-bottom:2px solid ${color.border};border-radius:2px;cursor:pointer"
      >${str}</span>`;
    },
    [anchors]
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
          <div style={{ position: "relative" }}>
            <Page
              pageNumber={currentPage}
              width={containerWidth}
              renderTextLayer={true}
              renderAnnotationLayer={false}
              customTextRenderer={customTextRenderer}
              loading={<PageLoadingSkeleton width={containerWidth} />}
              onLoadSuccess={(page) => {
                setPageWidth((page as { originalWidth?: number }).originalWidth ?? 595.5);
                if (onPageLoadSuccess) { onPageLoadSuccess(page); }
              }}
            />
            <AnnotationOverlay
              anchors={anchors}
              pageIndex={currentPage - 1}
              pageWidth={pageWidth}
              containerWidth={containerWidth}
              onApply={handleApply}
              onDismiss={handleDismiss}
            />
          </div>
        )}
      </Document>
    </div>
  );
}