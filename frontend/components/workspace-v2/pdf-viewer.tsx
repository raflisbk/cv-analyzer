/**
 * PdfViewer — SSR-safe wrapper untuk PdfViewerInner.
 * Menggunakan Next.js dynamic() dengan ssr: false supaya react-pdf tidak crash di server.
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
  onPageLoadSuccess?: (page: unknown) => void;
}

export function PdfViewer({ url, containerWidth, onPageLoadSuccess }: PdfViewerProps) {
  if (!url) {
    return (
      <div
        className="flex min-h-[1080px] max-w-[860px] mx-auto items-center justify-center rounded-2xl bg-[#FFFDF4] shadow-[0_8px_48px_rgba(0,0,0,0.65)]"
        role="alert"
      >
        <p className="text-sm text-[rgba(17,17,17,0.55)] text-center max-w-[280px]">
          PDF tidak tersedia. File mungkin belum diproses.
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
      onPageLoadSuccess={onPageLoadSuccess}
    />
  );
}
