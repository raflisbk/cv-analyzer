"use client";

import dynamic from "next/dynamic";
import { useAppWorkspacePdfWidth } from "@/hooks/use-app-workspace-pdf-width";
import { useAppWorkspacePdfUrl } from "@/hooks/use-app-workspace-pdf-url";
import { PdfViewerSkeleton } from "./pdf/pdf-viewer-skeleton";
import styles from "./workspace-styles";

const PdfViewer = dynamic(
  () =>
    import("@/components/app-workspace/pdf/pdf-viewer").then(
      (module) => module.PdfViewer,
    ),
  { ssr: false },
);

export function WorkspacePdf({
  jobId,
  file,
}: {
  jobId: string;
  file: Blob | null;
}) {
  const { pdfRef, pageWidth } = useAppWorkspacePdfWidth("pdf");
  const url = useAppWorkspacePdfUrl(file);
  return (
    <div
      ref={pdfRef}
      className={styles.frame}
      aria-label="Original PDF preview"
    >
      {url ? (
        <PdfViewer url={url} containerWidth={pageWidth} jobId={jobId} />
      ) : (
        <PdfViewerSkeleton />
      )}
    </div>
  );
}
