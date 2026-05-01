"use client";

import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { createPortal } from "react-dom";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
import { AnnotationOverlay } from "./annotation-overlay";
import { InlineEditPopover } from "./inline-edit-popover";
import { useInlineEdit } from "@/hooks/use-inline-edit";
import { useWorkspaceV2Store } from "@/lib/stores/workspace-v2-store";
import type { SuggestionAnchorRecord } from "@/lib/workspace";

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
  const [_numPages, setNumPages] = useState<number>(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [pageWidth, setPageWidth] = useState<number>(595.5);

  const isValidPage = _numPages === 0 || currentPage <= _numPages;

  const setSuggestionStatus = useWorkspaceV2Store((s) => s.setSuggestionStatus);

  const handleApply = useCallback((id: string) => {
    console.warn("[PDF Viewer] Applying:", id);
    setSuggestionStatus(id, "applied");
  }, [setSuggestionStatus]);

  const handleDismiss = useCallback((id: string) => {
    console.warn("[PDF Viewer] Dismissing:", id);
    setSuggestionStatus(id, "dismissed");
  }, [setSuggestionStatus]);

  const { state: inlineEditState, handleSelectionChange, closePopover } = useInlineEdit(jobId);

  const cvDocument = useWorkspaceV2Store((s) => s.cvDocument);
  const viewMode = useWorkspaceV2Store((s) => s.viewMode);

  const _scrollCleanup = useCallback(() => {
    const container = document.querySelector(".react-pdf-document");
    if (container) {
      const handler = () => {
        if (inlineEditState.isVisible) {
          closePopover();
        }
      };
      container.addEventListener("scroll", handler);
      return () => container.removeEventListener("scroll", handler);
    }
    return undefined;
  }, [inlineEditState.isVisible, closePopover]);

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
    <div className="relative" onMouseUp={handleSelectionChange}>
      <Document
        file={url}
          onLoadSuccess={({ numPages: n }: { numPages: number }) => {
            setNumPages(n);
            if (onDocumentLoadSuccess) {
              onDocumentLoadSuccess(n);
            }
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
              onLoadSuccess={(page: unknown) => {
                const pw = (page as { originalWidth?: number }).originalWidth ?? 595.5;
                setPageWidth(pw);
                if (onPageLoadSuccess) {
                  onPageLoadSuccess(page);
                }
              }}
            />
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

            {viewMode !== "original" &&
              Object.entries(cvDocument || {}).map(([id, patch]) => {
                const p = patch as { rewrittenText: string; rectPercent?: { left: number; top: number; width: number; height: number } };
                if (!p.rectPercent) {
                  return null;
                }
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