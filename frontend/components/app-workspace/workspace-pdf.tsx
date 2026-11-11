"use client";

import dynamic from "next/dynamic";
import { useAppWorkspacePdfWidth } from "@/hooks/use-app-workspace-pdf-width";
import styles from "./workspace-styles";

const PdfViewer = dynamic(
  () =>
    import("@/components/workspace-v2/pdf-viewer").then(
      (module) => module.PdfViewer,
    ),
  { ssr: false },
);

export function WorkspacePdf({
  jobId,
  url,
}: {
  jobId: string;
  url: string | null;
}) {
  const { pdfRef, pageWidth } = useAppWorkspacePdfWidth("pdf");
  return (
    <div
      ref={pdfRef}
      className={styles.frame}
      aria-label="Original PDF preview"
    >
      <PdfViewer url={url} containerWidth={pageWidth} jobId={jobId} />
    </div>
  );
}
