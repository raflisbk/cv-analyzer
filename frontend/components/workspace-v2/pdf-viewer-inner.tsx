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
import { useState, useCallback, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import type { PageProps } from "react-pdf";
import { createPortal } from "react-dom";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { AnnotationOverlay } from "./annotation-overlay";
import { InlineEditPopover } from "./inline-edit-popover";
import { useInlineEdit } from "@/hooks/use-inline-edit";
import { useWorkspaceV2Store } from "@/lib/stores/workspace-v2-store";
import type { SuggestionAnchorRecord } from "@/lib/workspace";

// Derive CustomTextRenderer from PageProps so we don't rely on a non-exported type
type CustomTextRenderer = NonNullable<PageProps["customTextRenderer"]>;

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
  scale?: number;
  onPageLoadSuccess?: (page: unknown) => void;
  onDocumentLoadSuccess?: (numPages: number) => void;
  anchors?: SuggestionAnchorRecord[];
  suggestions?: any[];
  jobId?: string;
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
  scale = 1.0,
  onPageLoadSuccess,
  onDocumentLoadSuccess,
  anchors = [],
  suggestions = [],
  jobId = "",
}: PdfViewerInnerProps) {
  // _numPages: tracks total page count; used by Phase 14-03 for page boundary checks
  const [_numPages, setNumPages] = useState<number>(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pageWidth, setPageWidth] = useState<number>(595.5);

  // Guard: Don't render page beyond PDF page count (e.g., when PDF has 1 page but state shows page 2)
  const isValidPage = _numPages === 0 || currentPage <= _numPages;

  // Debug: Log anchors prop on every render
  console.log("[PDF Viewer] Render - Anchors prop:", {
    hasAnchors: !!anchors,
    anchorCount: anchors?.length ?? 0,
    firstAnchor: anchors?.[0]?.suggestion_id ?? null,
    anchors: anchors?.slice(0, 3) ?? [], // Log first 3 for debugging
  });

  // Set up worker on mount - use CDN version for Next.js 15 compatibility
  useEffect(() => {
    pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
  }, []);

  const setSuggestionStatus = useWorkspaceV2Store((s) => s.setSuggestionStatus);

  const handleApply = useCallback((id: string) => {
    console.log("[PDF Viewer] Applying suggestion:", id);
    setSuggestionStatus(id, "applied");
  }, [setSuggestionStatus]);

  const handleDismiss = useCallback((id: string) => {
    console.log("[PDF Viewer] Dismissing suggestion:", id);
    setSuggestionStatus(id, "dismissed");
  }, [setSuggestionStatus]);

  // Inline edit hook for text selection detection
  const { state: inlineEditState, handleSelectionChange, closePopover } = useInlineEdit(jobId);

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

  // Dismiss inline edit popover on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (inlineEditState.isVisible) {
        closePopover();
      }
    };

    const container = document.querySelector(".react-pdf-document");
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [inlineEditState.isVisible, closePopover]);

  const cvDocument = useWorkspaceV2Store((s) => s.cvDocument);
  const viewMode = useWorkspaceV2Store((s) => s.viewMode);

  return (
    <div className="relative" onMouseUp={handleSelectionChange}>
      <Document
        file={url}
        onLoadSuccess={({ numPages: n }) => {
          setNumPages(n);
          if (onDocumentLoadSuccess) { onDocumentLoadSuccess(n); }
        }}
        onLoadError={(err) => setLoadError(err.message)}
        loading={<PageLoadingSkeleton width={containerWidth} />}
        error={null}
      >
        {containerWidth > 0 && isValidPage && (
          <div style={{ position: "relative" }}>
            <Page
              pageNumber={currentPage}
              width={containerWidth}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={false}
              loading={<PageLoadingSkeleton width={containerWidth} />}
              onLoadSuccess={(page) => {
                setPageWidth((page as { originalWidth?: number }).originalWidth ?? 595.5);
                if (onPageLoadSuccess) { onPageLoadSuccess(page); }
              }}
            />
            {/* Render AI Suggestions Overlay */}
            <AnnotationOverlay
              anchors={anchors}
              pageIndex={currentPage - 1}
              pageWidth={pageWidth}
              containerWidth={containerWidth}
              scale={scale}
              suggestions={suggestions}
              onApply={handleApply}
              onDismiss={handleDismiss}
            />

            {/* Render Manual Inline Edit Patches */}
            {viewMode !== "original" &&
              Object.entries(cvDocument || {}).map(([id, patch]) => {
                const p = patch as { rewrittenText: string; rectPercent?: { left: number; top: number; width: number; height: number } };
                if (!p.rectPercent) return null;
                return (
                  <div
                    key={id}
                    style={{
                      position: "absolute",
                      left: `${p.rectPercent.left}%`,
                      top: `calc(${p.rectPercent.top}% - 2px)`,
                      width: `calc(${p.rectPercent.width}% + 4px)`,
                      minHeight: `calc(${p.rectPercent.height}% + 4px)`,
                      height: "max-content",
                      zIndex: 10,
                      background: "#ffffff",
                      padding: "2px 4px",
                      color: "#111111",
                      fontFamily: "var(--font-sans), sans-serif",
                      fontSize: "11px",
                      lineHeight: "1.4",
                      border: "1px solid rgba(202, 255, 67, 0.8)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      borderRadius: "3px",
                      pointerEvents: "none",
                      transformOrigin: "top left",
                    }}
                    aria-hidden="true"
                  >
                    {p.rewrittenText}
                  </div>
                );
              })}
          </div>
        )}
      </Document>

      {/* Inline edit popover - rendered via Portal */}
      {inlineEditState.isVisible &&
        inlineEditState.selectionRect &&
        createPortal(
          <InlineEditPopover
            rect={inlineEditState.selectionRect}
            rectPercent={inlineEditState.rectPercent}
            selectedText={inlineEditState.selectedText}
            jobId={jobId}
            onClose={closePopover}
          />,
          document.body
        )}
    </div>
  );
}