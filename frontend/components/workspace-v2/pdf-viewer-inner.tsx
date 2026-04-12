"use client";
/**
 * PdfViewerInner — iframe-based PDF viewer.
 * Uses native browser PDF rendering to avoid pdfjs-dist Webpack bundling issues.
 * Page navigation is controlled externally via the `currentPage` prop (managed by PdfViewerPanel).
 * Appends #toolbar=0&navpanes=0&scrollbar=0 to suppress browser native PDF chrome in Chrome/Edge.
 * Phase 13: basic viewer. Annotation overlays added in Phase 14.
 */

interface PdfViewerInnerProps {
  url: string;
  containerWidth: number;
  currentPage?: number;
  /** Placeholder — kept for API compatibility with Phase 14 annotation spike */
  onPageLoadSuccess?: (page: unknown) => void;
}

export default function PdfViewerInner({
  url,
  containerWidth,
  currentPage = 1,
}: PdfViewerInnerProps) {
  // Suppress browser PDF chrome — works in Chrome & Edge
  const fragments = [
    "toolbar=0",
    "navpanes=0",
    "scrollbar=0",
    ...(currentPage > 1 ? [`page=${currentPage}`] : []),
  ].join("&");
  const iframeSrc = `${url}#${fragments}`;

  const height = Math.round(containerWidth * 1.414); // A4 ratio

  return (
    <iframe
      key={iframeSrc}
      src={iframeSrc}
      title="CV Document Preview"
      width={containerWidth}
      height={height}
      className="block border-0"
      style={{ minHeight: 1080, width: containerWidth }}
    />
  );
}
