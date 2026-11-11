import type { CvSummary } from "../cvs.types";

export const cvFixtures: CvSummary[] = [
  {
    jobId: "samuel-2026",
    fileName: "Samuel_CV_2026.pdf",
    targetRole: "Product Designer",
    score: 77,
    status: "complete",
    updatedAt: new Date().toISOString(),
    pages: 1,
    wordCount: 412,
  },
  {
    jobId: "product-v2",
    fileName: "CV Product v2.docx",
    targetRole: "Product Manager",
    score: 71,
    status: "complete",
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    pages: 2,
    wordCount: 681,
  },
  {
    jobId: "samuel-old",
    fileName: "Samuel_CV_old.pdf",
    targetRole: null,
    score: 58,
    status: "complete",
    updatedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    pages: 1,
    wordCount: 360,
  },
];
