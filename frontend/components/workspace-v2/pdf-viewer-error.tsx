
import { AlertTriangle } from "lucide-react";

type ErrorType = "no-file" | "network" | "generic";

interface PdfViewerErrorProps {
  onRetry?: () => void;
  errorType?: ErrorType;
}

const ERROR_MESSAGES: Record<ErrorType, string> = {
  "no-file": "PDF tidak tersedia. File mungkin belum diproses.",
  "network": "Dokumen tidak dapat dimuat. Periksa koneksi internet.",
  "generic": "Terjadi kesalahan saat memuat dokumen. Coba muat ulang halaman.",
};

export function PdfViewerError({
  onRetry,
  errorType = "generic",
}: PdfViewerErrorProps) {
  return (
    <div
      role="alert"
      className="
        flex min-h-[1080px] max-w-[860px] mx-auto
        flex-col items-center justify-center gap-4
        rounded-2xl bg-[#FFFDF4]
        border border-[rgba(202,255,67,0.08)]
        shadow-[0_8px_48px_rgba(0,0,0,0.65)]
        p-8
      "
    >
      <AlertTriangle
        className="h-8 w-8 text-[--ws-destructive]"
        aria-hidden="true"
      />

      <h2 className="text-[15px] font-bold text-[rgba(17,17,17,0.9)] text-center">
        Dokumen Tidak Tersedia
      </h2>

      <p className="max-w-[280px] text-center text-sm text-[rgba(17,17,17,0.55)]">
        {ERROR_MESSAGES[errorType]}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-[#111111] px-4 py-2 text-sm font-bold text-[#F5F2D8] hover:bg-[#1A1A1A] transition-colors duration-150"
        >
          Muat Ulang
        </button>
      )}
    </div>
  );
}
