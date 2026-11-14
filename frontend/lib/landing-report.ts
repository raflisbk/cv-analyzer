export const scoreBars = [
  { label: "Impact", value: 82, before: 70 },
  { label: "Clarity", value: 90, before: 90 },
  { label: "Relevance", value: 82, before: 82 },
  { label: "Completeness", value: 94, before: 94 },
] as const;

export const scoreRewrite = {
  flag: "No number",
  before: "Led a team of developers on the checkout rebuild.",
  after: "Led the checkout rebuild with a team of developers.",
} as const;
