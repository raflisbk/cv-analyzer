import { apiFetch, ApiError } from "@/lib/api";
import { getWorkspaceHydration } from "@/lib/workspace";
import { USE_APP_MOCKS } from "./mode";
import { draftText } from "@/lib/app-export/draft-text";
import {
  exportPreview,
  exportTemplates,
  mockExportPdf,
} from "./fixtures/export";
import type {
  ExportPreview,
  ExportRequest,
  ExportTemplate,
} from "./export.types";

export async function getExportTemplates(): Promise<ExportTemplate[]> {
  return USE_APP_MOCKS
    ? exportTemplates
    : apiFetch<ExportTemplate[]>("/export/templates");
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
): Promise<Blob> {
  if (USE_APP_MOCKS) {
    return mockExportPdf();
  }
  const response = await fetch(
    `/api/v1/jobs/${encodeURIComponent(jobId)}/export`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    },
  );
  if (!response.ok) {
    throw new ApiError(
      "EXPORT_FAILED",
      `PDF export failed (${response.status}).`,
    );
  }
  const blob = await response.blob();
  if (!blob.size) {
    throw new ApiError("EMPTY_EXPORT", "The exported PDF is empty.");
  }
  return blob;
}
