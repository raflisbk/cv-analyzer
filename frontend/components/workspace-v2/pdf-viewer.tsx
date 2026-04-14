/**
 * PdfViewer — SSR-safe wrapper for PdfViewerInner.
 * Uses Next.js dynamic() with ssr: false so react-pdf doesn't crash on the server.
 * (LAYOUT-02, PDF-01)
 */
import dynamic from "next/dynamic";
import { PdfViewerSkeleton } from "./pdf-viewer-skeleton";

const PdfViewerInner = dynamic(
  () => import("./pdf-viewer-inner"),
  {
    ssr: false,
    loading: () => <PdfViewerSkeleton />,
  }
);

interface PdfViewerProps {
  url: string | null;
  containerWidth: number;
  currentPage?: number;
  onPageLoadSuccess?: (page: unknown) => void;
  onDocumentLoadSuccess?: (numPages: number) => void;
  anchors?: any[];
}

export function PdfViewer({ url, containerWidth, currentPage = 1, onPageLoadSuccess, onDocumentLoadSuccess, anchors }: PdfViewerProps) {
  if (!url) {
    return (
      <div
        className="flex min-h-[1080px] items-center justify-center"
        role="alert"
      >
        <p className="text-sm text-[rgba(17,17,17,0.45)] text-center max-w-[280px]">
          PDF unavailable. The file may still be processing.
        </p>
      </div>
    );
  }

  if (containerWidth === 0) {
    return <PdfViewerSkeleton />;
  }

  return (
    <PdfViewerInner
      url={url}
      containerWidth={containerWidth}
      currentPage={currentPage}
      onPageLoadSuccess={onPageLoadSuccess}
      onDocumentLoadSuccess={onDocumentLoadSuccess}
      anchors={anchors}
    />
  );
}
