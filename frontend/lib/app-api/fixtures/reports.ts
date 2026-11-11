import type { ReportsData } from "../reports.types";
import { cvFixtures } from "./cvs";

const [first, second, third] = cvFixtures;

export const reportFixtures: ReportsData = {
  reports: [
    {
      jobId: first.jobId,
      fileName: first.fileName,
      role: first.targetRole,
      analyzedAt: first.updatedAt,
      score: 77,
      dimensions: { impact: 58, clarity: 86, relevance: 74, completeness: 90 },
      versions: [
        { label: "v1", score: 71, at: first.updatedAt },
        { label: "v2", score: 77, at: first.updatedAt },
      ],
      topFix: "Add the result of the checkout rebuild as a number.",
      fileFacts: { type: "PDF", pages: 1, sizeKb: 212, bullets: 9 },
    },
    {
      jobId: second.jobId,
      fileName: second.fileName,
      role: second.targetRole,
      analyzedAt: second.updatedAt,
      score: 71,
      dimensions: { impact: 64, clarity: 80, relevance: 70, completeness: 78 },
      versions: [
        { label: "v1", score: 68, at: second.updatedAt },
        { label: "v2", score: 71, at: second.updatedAt },
      ],
      topFix: "Quantify the roadmap you owned.",
      fileFacts: { type: "DOCX", pages: 2, sizeKb: 96, bullets: 14 },
    },
    {
      jobId: third.jobId,
      fileName: third.fileName,
      role: third.targetRole,
      analyzedAt: third.updatedAt,
      score: 58,
      dimensions: { impact: 45, clarity: 70, relevance: 52, completeness: 66 },
      versions: [{ label: "v1", score: 58, at: third.updatedAt }],
      topFix: "Pick a target role so relevance can be scored.",
      fileFacts: { type: "PDF", pages: 1, sizeKb: 188, bullets: 7 },
    },
  ],
  aggregate: {
    count: 3,
    bestScore: 77,
    averageImpact: 56,
    lastAnalysisAt: first.updatedAt,
    openFixes: 2,
    recurringFixes: [
      {
        dimension: "Impact",
        cvCount: 3,
        text: "Bullets describe work without a number.",
      },
      {
        dimension: "Clarity",
        cvCount: 2,
        text: "Vague verbs such as improved or helped.",
      },
      {
        dimension: "Relevance",
        cvCount: 2,
        text: "Role keywords missing from the skills section.",
      },
    ],
    averageByDimension: {
      impact: 56,
      clarity: 79,
      relevance: 65,
      completeness: 78,
    },
  },
};
