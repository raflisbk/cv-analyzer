import dynamic from "next/dynamic";
import { PdfViewerSkeleton } from "./pdf-viewer-skeleton";
import type { SuggestionAnchorRecord } from "@/lib/workspace";
import type { SuggestionCard } from "@/lib/types";

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
  scale?: number;
  onPageLoadSuccess?: (page: unknown) => void;
  onDocumentLoadSuccess?: (numPages: number) => void;
  anchors?: SuggestionAnchorRecord[];
  suggestions?: SuggestionCard[];
  jobId?: string;
}

export function PdfViewer({
  url, containerWidth, currentPage = 1, scale = 1.0,
  onPageLoadSuccess, onDocumentLoadSuccess, anchors, suggestions, jobId
}: PdfViewerProps) {
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
      scale={scale}
      onPageLoadSuccess={onPageLoadSuccess}
      onDocumentLoadSuccess={onDocumentLoadSuccess}
      anchors={anchors}
      suggestions={suggestions}
      jobId={jobId}
    />
  );
}
