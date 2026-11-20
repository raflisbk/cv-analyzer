const appExportEn = {
  title: "Export",
  heading: "Choose an ATS template",
  close: "Close export",
  loading: "Loading export preview",
  loadError: "Could not load export options.",
  retry: "Try again",
  noTemplates: "No export templates are available.",
  checkingOriginal: "Checking original file…",
  originalMissing:
    "Original layout is unavailable because the uploaded file is missing. Choose another template to export.",
  templates: "ATS templates",
  atsBadge: "ATS {score}",
  yourUpload: "Your upload",
  originalPreserved:
    "Your uploaded layout is preserved in the final export. Only applied fixes change.",
  format: "Format",
  pdfMeta: "A4 · selectable text",
  docxMeta: "Editable document",
  bannerOriginal:
    "Only your applied fixes change; everything else stays as you wrote it.",
  bannerTemplate:
    "{name} template: your content is reflowed into this layout. Applied fixes stay highlighted.",
  previewLabel: "{name} {format} preview",
  skippedFixes: "Skipped fixes",
  fixFallback: "Fix {id}",
  preparing: "Preparing {format}…",
  retryDownload: "Retry download",
  download: "Download {format}",
  cancel: "Cancel",
  ready: "Your {format} is ready! {applied} fixes applied, {skipped} skipped.",
  failed: "Could not export the PDF. Try again.",
  emptyExport: "The exported PDF is empty.",
  skipped: {
    no_room:
      "No room in your original layout: this line stays as you wrote it.",
    needs_input: "This fix needs your answer before it can be applied.",
    text_not_found: "The original line was not found in this file.",
    missing_text: "This fix has no replacement text to export.",
    other: "This fix could not be applied to the exported file.",
  },
};
export default appExportEn;
