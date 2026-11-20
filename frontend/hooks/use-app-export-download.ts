"use client";

import { useCallback, useState } from "react";
import { useT } from "@/components/i18n/i18n-provider";
import { usePathy } from "@/components/pathy/pathy-context";
import { ApiError } from "@/lib/api";
import { exportCv } from "@/lib/app-api/export";
import type { ExportPreview, ExportTemplate } from "@/lib/app-api/export.types";
import { exportFilename, saveExportPdf } from "@/lib/app-export/download";

type Translate = ReturnType<typeof useT>["t"];
const SKIPPED_CODES = [
  "no_room",
  "needs_input",
  "text_not_found",
  "missing_text",
];

function skippedLines(
  t: Translate,
  reasons: Record<string, string> | undefined,
  titles: Record<string, string>,
) {
  return Object.entries(reasons ?? {}).map(([id, code]) => ({
    id,
    title: titles[id] ?? t("appExport.fixFallback", { id }),
    message: t(
      `appExport.skipped.${SKIPPED_CODES.includes(code) ? code : "other"}`,
    ),
  }));
}

function exportErrorMessage(t: Translate, cause: unknown): string {
  if (cause instanceof ApiError && cause.code === "EMPTY_EXPORT") {
    return t("appExport.emptyExport");
  }
  return cause instanceof Error ? cause.message : t("appExport.failed");
}

async function saveExport(
  t: Translate,
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
    message: t("appExport.ready", {
      format,
      applied: result.applied,
      skipped: result.skipped,
    }),
    reasons: skippedLines(t, result.skippedReasons, fixTitles),
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
  const [reasons, setReasons] = useState<ReturnType<typeof skippedLines>>([]);
  const pathy = usePathy();
  const { t } = useT();
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
          t,
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
        const message = exportErrorMessage(t, cause);
        setError(message);
        pathy.react("sad", message, anchor);
      } finally {
        setDownloading(false);
      }
    },
    [
      answers,
      downloading,
      fixIds,
      fixTitles,
      jobId,
      pathy,
      preview,
      selected,
      t,
    ],
  );
  return { downloading, error, resultMessage, reasons, download };
}
