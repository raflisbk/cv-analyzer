export interface AtsData {
  score: number;
  summary: string;
  compat: { system: string; rating: number }[];
  parsed: { field: string; value: string; confidence: number }[];
  plainText: { lines: { text: string; flagged: boolean }[]; note: string };
  checks: { group: string; label: string; status: "pass" | "warn" | "fail" }[];
  hiddenText: { found: boolean; items: string[] };
}
