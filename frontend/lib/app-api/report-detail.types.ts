import type { VersionData } from "./history.types";

export interface ReportDimension {
  key: "impact" | "clarity" | "relevance" | "completeness";
  score: number;
  previous: number;
  projected: number;
  description: string;
  metrics: {
    key?: string;
    label: string;
    count?: number;
    total?: number;
    value: string;
    percent: number;
  }[];
  hint: string;
  evidence: {
    text: string;
    note: string;
    noteKey?: string;
    positive: boolean;
  }[];
}

export interface ReportDetail {
  fileName: string;
  role: string;
  version: string;
  score: number;
  previousScore: number;
  projectedScore: number;
  verdict: { key?: string; title: string; body: string };
  topPercent: number;
  facts: string[];
  factCounts: { pages: number; bullets: number; words: number };
  fixes: {
    title: string;
    text: string;
    points: number;
    section?: string;
    type?: string;
  }[];
  dimensions: ReportDimension[];
  sections: {
    key?: string;
    name: string;
    score: number;
    note: string;
    noteKey?: string;
  }[];
  bullets: {
    text: string;
    source: string;
    strength: "weak" | "fair" | "strong";
    tags: string[];
    tagKeys?: string[];
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
    format?: string;
    pages?: number;
    sizeKb?: number;
    checks: { text: string; ok: boolean }[];
  };
  versions: (Pick<VersionData, "label" | "score" | "at" | "summary"> &
    Partial<
      Pick<VersionData, "summaryKind" | "changedDimension" | "changedDelta">
    >)[];
}
