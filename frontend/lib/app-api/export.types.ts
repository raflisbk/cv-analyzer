export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  atsScore: number | null;
  original: boolean;
  traits: string[];
}

export interface ExportRequest {
  templateId: string;
  fixIds?: string[];
  answers?: Record<string, Record<string, string>>;
}

export interface ExportResult {
  blob: Blob;
  applied: number;
  skipped: number;
  fileName?: string;
  skippedReasons?: Record<string, string>;
}

export interface ExportPreview {
  fileName: string;
  originalText: string;
  editedText: string;
}
