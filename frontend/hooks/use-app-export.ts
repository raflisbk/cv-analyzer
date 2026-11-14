"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getExportPreview, getExportTemplates } from "@/lib/app-api/export";
import { getJobFileUrl, getJobResults } from "@/lib/app-api/workspace";
import { flattenFixes } from "@/lib/app-workspace/fixes";
import { USE_APP_MOCKS } from "@/lib/app-api/mode";
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
  const suggestions = useQuery({
    queryKey: ["job-results", jobId],
    queryFn: () => getJobResults(jobId),
    enabled: !USE_APP_MOCKS,
    retry: false,
  });
  const fixTitles = Object.fromEntries(
    flattenFixes(suggestions.data?.suggestions).map((fix) => [
      fix.id,
      `${fix.section}: ${fix.explanation}`,
    ]),
  );
  const [selectedId, setSelectedId] = useState("original");
  const selected =
    templates.data?.find((template) => template.id === selectedId) ??
    templates.data?.[0];
  const originalFile = useQuery({
    queryKey: ["app-file", jobId],
    queryFn: () => getJobFileUrl(jobId),
    enabled: !USE_APP_MOCKS && Boolean(selected?.original),
    retry: false,
  });
  const { downloading, error, resultMessage, reasons, download } =
    useAppExportDownload({
      jobId,
      selected,
      preview: preview.data,
      fixIds,
      answers,
      fixTitles,
    });
  return {
    templates,
    preview,
    selected,
    selectedId,
    originalFile,
    setSelectedId,
    downloading,
    error,
    resultMessage,
    reasons,
    download,
  };
}
