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

export const demoMatch = {
  score: 78,
  requirements: [
    { label: "Product design", evidence: "Payly · Product Designer", status: "Met" },
    { label: "Checkout flows", evidence: "Checkout rebuild", status: "Met" },
    { label: "Research ops", evidence: "Not shown in CV", status: "Missing" },
  ],
} as const;

export const demoTemplates = ["Clean", "Classic", "Modern"] as const;
