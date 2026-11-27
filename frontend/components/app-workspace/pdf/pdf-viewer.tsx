import dynamic from "next/dynamic";
import { useT } from "@/components/i18n/i18n-provider";
import { PdfViewerSkeleton } from "./pdf-viewer-skeleton";
import type { SuggestionAnchorRecord } from "@/lib/workspace";
import type { SuggestionCard } from "@/lib/types";

const PdfViewerInner = dynamic(() => import("./pdf-viewer-inner"), {
  ssr: false,
  loading: () => <PdfViewerSkeleton />,
});

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
  url,
  containerWidth,
  currentPage = 1,
  scale = 1.0,
  onPageLoadSuccess,
  onDocumentLoadSuccess,
  anchors,
  suggestions,
  jobId,
}: PdfViewerProps) {
  const { t } = useT();
  if (!url) {
    return (
      <div
        className="flex min-h-[1080px] items-center justify-center"
        role="alert"
      >
        <p className="text-sm text-[var(--app-ink-soft)] text-center max-w-[280px]">
          {t("appWorkspace.state.fileMissing")}
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
