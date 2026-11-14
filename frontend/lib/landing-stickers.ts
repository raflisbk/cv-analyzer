import { scoreBars, scoreRewrite } from "@/lib/landing-report";

export const demoScores = scoreBars;
export const demoMatch = {
  score: 78,
  requirements: [
    {
      label: "Product design",
      evidence: "Payly · Product Designer",
      status: "Met",
    },
    { label: "Checkout flows", evidence: "Checkout rebuild", status: "Met" },
    { label: "Research ops", evidence: "Not shown in CV", status: "Missing" },
  ],
} as const;
export const demoRewrite = scoreRewrite;
export const demoTemplates = ["Clean", "Classic", "Modern"] as const;
