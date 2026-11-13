"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getExportPreview, getExportTemplates } from "@/lib/app-api/export";
import { useAppExportDownload } from "./use-app-export-download";

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
  const selected =
    templates.data?.find((template) => template.id === selectedId) ??
    templates.data?.[0];
  const { downloading, error, resultMessage, download } = useAppExportDownload({
    jobId,
    selected,
    preview: preview.data,
    fixIds,
    answers,
  });
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
