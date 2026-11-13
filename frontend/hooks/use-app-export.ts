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

export function useAppExport(jobId: string) {
  const templates = useQuery({
    queryKey: ["export-templates"],
    queryFn: getExportTemplates,
  });
  const preview = useQuery({
    queryKey: ["export-preview", jobId],
    queryFn: () => getExportPreview(jobId),
  });
  const [selectedId, setSelectedId] = useState("original");
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pathy = usePathy();
  const selected =
    templates.data?.find((template) => template.id === selectedId) ??
    templates.data?.[0];
  const download = useCallback(
    async (anchor: HTMLElement | null) => {
      if (!selected || !preview.data || downloading) return;
      setDownloading(true);
      setError(null);
      try {
        const blob = await exportCv(jobId, { templateId: selected.id });
        saveExportPdf(blob, exportFilename(preview.data.fileName, selected.id));
        pathy.react("cheer", "Your PDF is ready!", anchor);
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
    [downloading, jobId, pathy, preview.data, selected],
  );
  return {
    templates,
    preview,
    selected,
    selectedId,
    setSelectedId,
    downloading,
    error,
    download,
  };
}
