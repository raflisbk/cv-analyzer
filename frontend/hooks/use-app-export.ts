"use client";

import { useCallback, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePathy } from "@/components/pathy/pathy-context";
import {
  exportCv,
  getExportPreview,
  getExportTemplates,
} from "@/lib/app-api/export";
import { exportFilename, saveExportPdf } from "@/lib/app-export/download";

export function useAppExport(
  jobId: string,
  fixIds?: string[],
  answers?: Record<string, Record<string, string>>,
) {
  const templates = useQuery({
    queryKey: ["export-templates", jobId],
    queryFn: () => getExportTemplates(jobId),
  });
  const preview = useQuery({
    queryKey: ["export-preview", jobId],
    queryFn: () => getExportPreview(jobId),
  });
  const [selectedId, setSelectedId] = useState("original");
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const pathy = usePathy();
  const selected =
    templates.data?.find((template) => template.id === selectedId) ??
    templates.data?.[0];
  const download = useCallback(
    async (anchor: HTMLElement | null) => {
      if (!selected || !preview.data || downloading) return;
      setDownloading(true);
      setError(null);
      setResultMessage(null);
      try {
        const result = await exportCv(jobId, {
          templateId: selected.id,
          fixIds: fixIds ?? [],
          answers: answers ?? {},
        });
        const fileName =
          result.fileName ?? exportFilename(preview.data.fileName, selected.id);
        saveExportPdf(result.blob, fileName);
        const format = fileName.toLowerCase().endsWith(".docx")
          ? "DOCX"
          : "PDF";
        const message = `Your ${format} is ready! ${result.applied} fixes applied, ${result.skipped} skipped.`;
        setResultMessage(message);
        pathy.react("cheer", message, anchor);
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
    [answers, downloading, fixIds, jobId, pathy, preview.data, selected],
  );
  return {
    templates,
    preview,
    selected,
    selectedId,
    setSelectedId,
    downloading,
    error,
    resultMessage,
    download,
  };
}
