"use client";

import { useState, useEffect } from "react";
import { getJobFileUrl } from "@/lib/workspace";
import { FileText, Loader2, AlertCircle } from "lucide-react";

interface PDFPreviewProps {
  jobId: string;
  fileName: string;
}

type LoadState = "loading" | "ready" | "error";

export function PDFPreview({ jobId, fileName }: PDFPreviewProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("loading");

  useEffect(() => {
    let cancelled = false;

    async function fetchUrl() {
      setLoadState("loading");
      try {
        const { file_url } = await getJobFileUrl(jobId);
        if (!cancelled) {
          setFileUrl(file_url);
          setLoadState("ready");
        }
      } catch {
        if (!cancelled) {
          setLoadState("error");
        }
      }
    }

    fetchUrl();
    return () => { cancelled = true; };
  }, [jobId]);

  /* ── Loading state ── */
  if (loadState === "loading") {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-3 rounded-xl border border-border bg-white/60">
        <Loader2 className="h-6 w-6 animate-spin text-[#141414]/40" />
        <p className="text-xs text-[#141414]/45">Loading original CV…</p>
      </div>
    );
  }

  /* ── Error state ── */
  if (loadState === "error" || !fileUrl) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-white/40 px-6 py-10 text-center">
        <AlertCircle className="h-6 w-6 text-[#141414]/30" />
        <p className="text-xs font-medium text-[#141414]/50">Could not load CV preview</p>
        <p className="text-[11px] text-[#141414]/35">
          The original file may have expired. Try refreshing the page.
        </p>
      </div>
    );
  }

  /* ── PDF iframe ── */
  const isPDF =
    fileName.toLowerCase().endsWith(".pdf") ||
    fileUrl.toLowerCase().includes(".pdf");

  if (isPDF) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
        {/* Toolbar strip */}
        <div className="flex items-center gap-2 border-b border-border bg-[#fafafa] px-4 py-2">
          <FileText className="h-3.5 w-3.5 text-[#141414]/40" />
          <span className="truncate text-[11px] text-[#141414]/50">{fileName}</span>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto shrink-0 text-[10px] font-medium text-[#141414]/40 underline-offset-2 hover:text-[#141414] hover:underline"
          >
            Open ↗
          </a>
        </div>

        {/* PDF embed */}
        <iframe
          src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=1`}
          title={`PDF preview: ${fileName}`}
          className="w-full"
          style={{ height: "calc(100vh - 200px)", minHeight: "540px", border: "none" }}
        />
      </div>
    );
  }

  /* ── Non-PDF fallback (DOCX etc.) — show download link ── */
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border border-border bg-white/60 px-6 py-10 text-center">
      <FileText className="h-8 w-8 text-[#141414]/25" />
      <div>
        <p className="text-sm font-medium text-[#141414]/70">{fileName}</p>
        <p className="mt-1 text-xs text-[#141414]/40">
          Preview is only available for PDF files.
        </p>
      </div>
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-lg bg-[#141414] px-4 py-2 text-xs font-semibold text-[#F5F2D8] transition-opacity hover:opacity-80"
      >
        Download to view
      </a>
    </div>
  );
}
