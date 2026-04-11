"use client";

/**
 * ExportStickyBar — Fixed bottom export toolbar.
 * Slides up with translate-y animation when analysisStatus === "complete".
 * Per UI-SPEC §7.5, D-C12, EXPORT-01, EXPORT-02.
 */

import { useEffect, useState } from "react";
import { Check, Clipboard, Download } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ExportStickyBarProps {
  jobId: string;
  analysisStatus: string;
  /** Preformatted suggestions payload for clipboard copy per EXPORT-02 */
  suggestionsClipboardText?: string;
}

export function ExportStickyBar({
  jobId,
  analysisStatus,
  suggestionsClipboardText,
}: ExportStickyBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Slide-up animation: delay 100ms after paint per UI-SPEC §7.5
  useEffect(() => {
    if (analysisStatus === "complete") {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [analysisStatus]);

  async function handleCopySuggestion() {
    const text = suggestionsClipboardText ?? "No suggestions available";
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      toast("Suggestions copied to clipboard");
      // Revert icon after 2000ms per UI-SPEC §8
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      toast("Failed to copy to clipboard");
    }
  }

  async function handleDownloadPdf() {
    toast("Preparing PDF download...");
    try {
      const response = await fetch(`/api/v1/jobs/${jobId}/export/pdf`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`PDF generation failed: ${response.status} ${errorText}`);
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error("Received empty PDF");
      }

      // Prefer server-provided filename from Content-Disposition, fallback to default
      const disposition = response.headers.get("content-disposition") ?? "";
      const match = disposition.match(/filename="?([^";]+)"?/);
      const filename = match?.[1] ?? `cv-analyze-${jobId.slice(0, 8)}.pdf`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully");
    } catch (error) {
      toast.error(`PDF download failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  // Always render the wrapper div to enable CSS transitions
  // Element is hidden below viewport (translate-y-full) when not complete
  return (
    /* h-14=56px, fixed bottom-0, z-50, slide-up animation per UI-SPEC §7.5 */
    <div
      className={`fixed bottom-0 left-0 right-0 h-14 z-50 bg-[#141414] border-t border-[#F5F2D8]/10
        px-4 flex items-center justify-end gap-2
        transition-all duration-300 ease-out
        ${analysisStatus === "complete" && isVisible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}
      role="toolbar"
      aria-label="Export options"
    >
      {/* Only render content when analysis is complete */}
      {analysisStatus === "complete" && (
        <>
          {/* Copy Suggestion — Mathical dark surface button per UI-SPEC §7.5 */}
          <Button
            onClick={handleCopySuggestion}
            aria-label="Copy all suggestions to clipboard"
            className="bg-[#F5F2D8]/10 text-[#F5F2D8] rounded-full hover:bg-[#F5F2D8]/20 border-0 h-9 px-4 text-sm"
          >
            {copySuccess
              ? <Check className="h-4 w-4 mr-2" />
              : <Clipboard className="h-4 w-4 mr-2" />
            }
            Copy Suggestions
          </Button>

          {/* Download PDF — lime accent button per UI-SPEC §7.5 */}
          <Button
            onClick={handleDownloadPdf}
            aria-label="Download analysis as PDF"
            className="bg-[#CAFF43] text-[#141414] rounded-full hover:bg-[#CAFF43]/85 border-0 h-9 px-4 text-sm font-extrabold"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </>
      )}
    </div>
  );
}
