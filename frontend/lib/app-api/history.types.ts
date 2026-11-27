export type VersionSummaryKind = "first" | "unchanged" | "changed";
export type VersionDimension =
  | "impact"
  | "clarity"
  | "relevance"
  | "completeness";

export interface VersionData {
  id: string;
  label: string;
  at: string;
  score: number;
  delta: number | null;
  summary: string;
  current: boolean;
  summaryKind?: VersionSummaryKind | null;
  changedDimension?: VersionDimension | null;
  changedDelta?: number | null;
}

export interface VersionDiff {
  before: string;
  after: string;
}

export type VersionDiffResult = VersionDiff | VersionDiff[];

export interface RestoredVersion {
  jobId: string;
  version: string;
}
