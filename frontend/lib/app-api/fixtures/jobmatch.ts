import type { JobMatchData } from "../jobmatch.types";

export const sampleJobDescription = `Senior Product Designer · Kopi Studio
We are looking for a Senior Product Designer to own onboarding and checkout. You will run user research and A/B tests, and work with our design system in Figma. SQL basics and stakeholder management are a plus.`;

export const jobMatchFixture: JobMatchData = {
  score: 72,
  headline: "Good fit, 2 gaps to close",
  summary: "Senior level matches. The must-have A/B testing is missing.",
  dimensions: [
    { key: "Skills", score: 80 },
    { key: "Experience", score: 70 },
    { key: "Education", score: 100 },
    { key: "Keywords", score: 60 },
    { key: "Seniority", score: 85 },
  ],
  requirements: [
    { label: "Figma", weight: "must", status: "met", evidence: "in CV" },
    {
      label: "User research",
      weight: "must",
      status: "met",
      evidence: "in CV",
    },
    {
      label: "Design systems",
      weight: "must",
      status: "met",
      evidence: "in CV",
    },
    { label: "A/B testing", weight: "must", status: "missing", evidence: "" },
    { label: "SQL", weight: "nice", status: "missing", evidence: "" },
    {
      label: "Stakeholder management",
      weight: "nice",
      status: "partial",
      evidence: "no example",
    },
  ],
};
