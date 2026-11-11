export interface Dimensions {
  impact: number;
  clarity: number;
  relevance: number;
  completeness: number;
}

export interface ReportSummary {
  jobId: string;
  fileName: string;
  role: string | null;
  analyzedAt: string;
  score: number;
  dimensions: Dimensions;
  versions: { label: string; score: number; at: string }[];
  topFix: string;
  fileFacts: { type: string; pages: number; sizeKb: number; bullets: number };
}

export interface ReportsData {
  reports: ReportSummary[];
  aggregate: {
    count: number;
    bestScore: number;
    averageImpact: number;
    lastAnalysisAt: string;
    openFixes: number;
    recurringFixes: { dimension: string; cvCount: number; text: string }[];
    averageByDimension: Dimensions;
  };
}
