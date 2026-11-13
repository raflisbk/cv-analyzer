export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  atsScore: number;
  original: boolean;
  traits: string[];
}

export interface ExportRequest {
  templateId: string;
  fixIds?: string[];
}

export interface ExportPreview {
  fileName: string;
  originalText: string;
  editedText: string;
}
