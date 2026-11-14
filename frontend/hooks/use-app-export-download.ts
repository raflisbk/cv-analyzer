"use client";

import { useCallback, useState } from "react";
import { usePathy } from "@/components/pathy/pathy-context";
import { exportCv } from "@/lib/app-api/export";
import type { ExportPreview, ExportTemplate } from "@/lib/app-api/export.types";
import { exportFilename, saveExportPdf } from "@/lib/app-export/download";
import { skippedReasonLines } from "@/lib/app-export/skipped-reasons";

async function saveExport(
  jobId: string,
  selected: ExportTemplate,
  preview: ExportPreview,
  fixIds?: string[],
  answers?: Record<string, Record<string, string>>,
  fixTitles: Record<string, string> = {},
) {
  const result = await exportCv(jobId, {
    templateId: selected.id,
    fixIds: fixIds ?? [],
    answers: answers ?? {},
  });
  const fileName =
    result.fileName ?? exportFilename(preview.fileName, selected.id);
  saveExportPdf(result.blob, fileName);
  const format = fileName.toLowerCase().endsWith(".docx") ? "DOCX" : "PDF";
  return {
    message: `Your ${format} is ready! ${result.applied} fixes applied, ${result.skipped} skipped.`,
    reasons: skippedReasonLines(result.skippedReasons, fixTitles),
  };
}

interface Options {
  jobId: string;
  selected?: ExportTemplate;
  preview?: ExportPreview;
  fixIds?: string[];
  answers?: Record<string, Record<string, string>>;
  fixTitles?: Record<string, string>;
}

export function useAppExportDownload(options: Options) {
  const { jobId, selected, preview, fixIds, answers, fixTitles = {} } = options;
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [reasons, setReasons] = useState<ReturnType<typeof skippedReasonLines>>(
    [],
  );
  const pathy = usePathy();
  const download = useCallback(
    async (anchor: HTMLElement | null) => {
      if (!selected || !preview || downloading) {
        return;
      }
      setDownloading(true);
      setError(null);
      setResultMessage(null);
      setReasons([]);
      try {
        const result = await saveExport(
          jobId,
          selected,
          preview,
          fixIds,
          answers,
          fixTitles,
        );
        setResultMessage(result.message);
        setReasons(result.reasons);
        pathy.react("cheer", result.message, anchor);
      } catch (cause) {
        const message =
          cause instanceof Error
            ? cause.message
            : "Could not export the PDF. Try again.";
        setError(message);
        pathy.react("sad", message, anchor);
      } finally {
        setDownloading(false);
      }
    },
    [answers, downloading, fixIds, fixTitles, jobId, pathy, preview, selected],
  );
  return { downloading, error, resultMessage, reasons, download };
}
