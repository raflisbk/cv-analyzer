export const processSteps = [
  { title: "Drop your CV", description: "PDF or DOCX, even a scan. Upload it and we take it from there.", image: "cloud-upload", sticker: "PDF · DOCX · scans", label: "Upload" },
  { title: "We read it", description: "Text, sections and skills are pulled out line by line, with OCR when the file is an image.", image: "scanner", sticker: "14 skills found", label: "Read" },
  { title: "It gets scored", description: "Impact, clarity, relevance and completeness, each checked more than once.", image: "chart", sticker: "86 overall", label: "Score" },
  { title: "Match it to a job", description: "Paste a job description. See your match percentage and the skills you are missing.", image: "target", sticker: "78% match", label: "Match" },
  { title: "Rewrite it line by line", description: "Open the workspace and reword any line. The editor knows your whole CV, and you can undo anything.", image: "pencil", sticker: "+40% clearer", label: "Fix" },
  { title: "Export and apply", description: "Download a clean PDF, ready to send.", image: "pdf-export", sticker: "PDF ready", label: "Export" },
] as const;
export function processStepProgress(index: number, count: number) { return count > 1 ? Math.min(1, Math.max(0, index / (count - 1))) : 0; }
