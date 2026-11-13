export function exportFilename(fileName: string, templateId: string): string {
  const stem =
    fileName.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9_-]+/g, "_") || "CV";
  return `${stem}-${templateId}.pdf`;
}

export function saveExportPdf(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
