export interface JobMatchData {
  score: number;
  headline: string;
  summary: string;
  dimensions: { key: string; score: number }[];
  requirements: {
    label: string;
    weight: "must" | "nice";
    status: "met" | "missing" | "partial";
    evidence: string;
  }[];
}
