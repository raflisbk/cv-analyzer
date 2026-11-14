import { apiFetch, ApiError } from "@/lib/api";
import { getWorkspaceHydration } from "@/lib/workspace";
import { USE_APP_MOCKS } from "./mode";
import { draftText } from "@/lib/app-export/draft-text";
import { parseSkippedReasons } from "@/lib/app-export/skipped-reasons";
import { responseError } from "./response-error";
import { rawRequest } from "./raw-request";
import {
  exportPreview,
  exportTemplates,
  mockExportPdf,
} from "./fixtures/export";
import type {
  ExportPreview,
  ExportRequest,
  ExportTemplate,
  ExportResult,
} from "./export.types";

export async function getExportTemplates(
  jobId?: string,
): Promise<ExportTemplate[]> {
  return USE_APP_MOCKS
    ? exportTemplates
    : apiFetch<ExportTemplate[]>(
        `/export/templates${jobId ? `?jobId=${encodeURIComponent(jobId)}` : ""}`,
      );
}

export async function getExportPreview(jobId: string): Promise<ExportPreview> {
  if (USE_APP_MOCKS) {
    return exportPreview;
  }
  const data = await getWorkspaceHydration(jobId);
  const source =
    data.document.source_text ??
    data.document.sections.map((section) => section.text).join("\n");
  const draft = data.document.draft_content?.document;
  const editedText = draft ? draftText(draft) : source;
  return {
    fileName: data.file.filename ?? "CV.pdf",
    originalText: source,
    editedText,
  };
}

export async function exportCv(
  jobId: string,
  request: ExportRequest,
): Promise<ExportResult> {
  if (USE_APP_MOCKS) {
    return {
      blob: mockExportPdf(),
      applied: request.fixIds?.length ?? 0,
      skipped: 0,
    };
  }
  const response = await rawRequest(
    `/api/v1/jobs/${encodeURIComponent(jobId)}/export`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    },
  );
  if (!response.ok) {
    throw await responseError(
      response,
      `PDF export failed (${response.status}).`,
    );
  }
  const blob = await response.blob();
  if (!blob.size) {
    throw new ApiError("EMPTY_EXPORT", "The exported PDF is empty.");
  }
  return {
    blob,
    applied: Number(response.headers.get("X-Export-Applied") ?? 0),
    skipped: Number(response.headers.get("X-Export-Skipped") ?? 0),
    skippedReasons: parseSkippedReasons(
      response.headers.get("X-Export-Skipped-Reasons"),
    ),
    fileName: response.headers
      .get("Content-Disposition")
      ?.match(/filename="?([^";]+)"?/)?.[1],
  };
}
