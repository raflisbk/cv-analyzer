export const scoreBars = [
  { key: "impact", value: 82, before: 70 },
  { key: "clarity", value: 90, before: 90 },
  { key: "relevance", value: 82, before: 82 },
  { key: "completeness", value: 94, before: 94 },
] as const;
export const demoMatch = {
  score: 78,
  requirements: [
    { key: "product", evidence: "payly", met: true },
    { key: "checkout", evidence: "checkoutEvidence", met: true },
    { key: "research", evidence: "absent", met: false },
  ],
} as const;
export const demoTemplates = ["clean", "classic", "modern"] as const;
