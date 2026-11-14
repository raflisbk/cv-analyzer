export interface ReportDimension {
  key: "impact" | "clarity" | "relevance" | "completeness";
  score: number;
  previous: number;
  projected: number;
  description: string;
  metrics: { label: string; value: string; percent: number }[];
  hint: string;
  evidence: { text: string; note: string; positive: boolean }[];
}

export interface ReportDetail {
  fileName: string;
  role: string;
  version: string;
  score: number;
  previousScore: number;
  projectedScore: number;
  verdict: { title: string; body: string };
  topPercent: number;
  facts: string[];
  fixes: {
    title: string;
    text: string;
    points: number;
    section?: string;
    type?: string;
  }[];
  dimensions: ReportDimension[];
  sections: { name: string; score: number; note: string }[];
  bullets: {
    text: string;
    source: string;
    strength: "weak" | "fair" | "strong";
    tags: string[];
  }[];
  grammar: {
    spelling: number;
    grammar: number;
    style: number;
    notes: { before: string; after: string; location: string }[];
  };
  keywords: {
    present: { name: string; count: number }[];
    missing: { name: string; posts: number }[];
    total: number;
  };
  ats: {
    score: number;
    facts: string[];
    checks: { text: string; ok: boolean }[];
  };
  versions: { label: string; score: number; at: string; summary: string }[];
}
