export const formatScore = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);
export const formatDelta = (value: number) =>
  `${value >= 0 ? "+" : ""}${formatScore(value)}`;
export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));

export const reportWeights = {
  impact: 35,
  clarity: 30,
  relevance: 20,
  completeness: 15,
} as const;
