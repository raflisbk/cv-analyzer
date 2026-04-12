"use client";
/**
 * PdfViewerInner — react-pdf Document+Page component.
 * Dimuat hanya via dynamic() dengan ssr: false (PDF-01, LAYOUT-02).
 * Worker menggunakan path statis ke /pdf.worker.min.mjs di public/ folder.
 * JANGAN gunakan new URL(..., import.meta.url) — crash di Next.js App Router webpack.
 *
 * Phase 13 Plan 06: Annotation spike terintegrasi — findTextRect dipanggil
 * saat page load untuk membuktikan koordinat mapping sebelum Phase 14.
 */
import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PdfViewerSkeleton } from "./pdf-viewer-skeleton";
import { PdfViewerError } from "./pdf-viewer-error";
import { findTextRect } from "@/lib/annotation-utils";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

// Worker setup — path statis ke /public/pdf.worker.min.mjs (PDF-01)
// Diset di module scope (aman karena file ini hanya diload client-side via dynamic import)
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface PdfViewerInnerProps {
  url: string;
  containerWidth: number;
  /** Callback untuk annotation spike — dipanggil dengan PDFPageProxy setelah page load */
  onPageLoadSuccess?: (page: unknown) => void;
}

export default function PdfViewerInner({
  url,
  containerWidth,
  onPageLoadSuccess,
}: PdfViewerInnerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [loadError, setLoadError] = useState<boolean>(false);

  const handleDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      setLoadError(false);
    },
    []
  );

  const handleDocumentLoadError = useCallback(() => {
    setLoadError(true);
  }, []);

  const handleRetry = useCallback(() => {
    setLoadError(false);
    setCurrentPage(1);
  }, []);

  /**
   * Annotation spike — dipanggil saat PDF page berhasil dimuat.
   * Membuktikan bahwa findTextRect bisa memetakan text → PDF bounding rect.
   * Phase 13 scope: hanya console.log — tidak ada overlay rendering.
   */
  const runAnnotationSpike = useCallback(
    async (page: unknown) => {
      // Spike: cari kata umum dalam CV sebagai proof-of-concept
      // Ini hanyalah proof-of-concept — di Phase 14 ini akan diintegrasikan
      // dengan hydration.suggestions dan scale factor yang benar
      const testSearchText = "Engineer"; // common word dalam CV
      const anchor = await findTextRect(
        page,
        testSearchText,
        currentPage - 1,
        "spike"
      );
      if (anchor) {
        console.log("[Annotation Spike] ✅ Text rect found:", anchor.rect);
      } else {
        console.log(
          "[Annotation Spike] ℹ️ Text not found (normal — depends on CV content)"
        );
      }
      // Teruskan ke parent callback (untuk future use)
      onPageLoadSuccess?.(page);
    },
    [currentPage, onPageLoadSuccess]
  );

  if (loadError) {
    return <PdfViewerError onRetry={handleRetry} errorType="generic" />;
  }

  return (
    <div className="flex flex-col">
      {/* PDF Toolbar — compact strip di atas document */}
      {numPages > 0 && (
        <div className="flex items-center justify-between px-4 py-2 bg-[rgba(17,17,17,0.04)]">
          <span className="text-xs font-bold text-[rgba(17,17,17,0.6)]">
            Halaman {currentPage} / {numPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              aria-label="Sebelumnya"
              className="flex h-7 w-7 items-center justify-center rounded text-xs text-[rgba(17,17,17,0.6)] hover:bg-[rgba(17,17,17,0.06)] disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
              disabled={currentPage >= numPages}
              aria-label="Berikutnya"
              className="flex h-7 w-7 items-center justify-center rounded text-xs text-[rgba(17,17,17,0.6)] hover:bg-[rgba(17,17,17,0.06)] disabled:opacity-30"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* react-pdf Document */}
      <Document
        file={url}
        onLoadSuccess={handleDocumentLoadSuccess}
        onLoadError={handleDocumentLoadError}
        loading={<PdfViewerSkeleton />}
      >
        <Page
          pageNumber={currentPage}
          width={containerWidth}
          renderTextLayer={true}
          renderAnnotationLayer={false}
          onLoadSuccess={runAnnotationSpike}
        />
      </Document>
    </div>
  );
}
