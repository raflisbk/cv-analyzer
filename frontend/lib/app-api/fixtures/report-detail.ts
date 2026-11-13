import type { ReportDetail } from "../report-detail.types";

export const reportDetailFixture: ReportDetail = {
  fileName: "Samuel_CV_2026.pdf",
  role: "Product Designer",
  version: "v2",
  score: 77,
  previousScore: 71,
  projectedScore: 88,
  verdict: {
    title: "Good, not yet strong.",
    body: "Your CV reads clearly and covers every section. It loses points because most bullets describe tasks, not results. Three edits could lift the score to 88.",
  },
  topPercent: 35,
  facts: ["9 bullets", "6 sections", "1 page", "187 words"],
  fixes: [
    {
      title: "Biggest win",
      text: "Put numbers on 6 bullets. Add only numbers you can verify.",
      points: 9,
    },
    {
      title: "Quick win",
      text: "Add A/B testing to skills if you have that experience.",
      points: 2,
    },
    {
      title: "Watch out",
      text: "Two-column layout may be read out of order by ATS.",
      points: 0,
    },
  ],
  dimensions: [
    {
      key: "impact",
      score: 64,
      previous: 56,
      projected: 85,
      description: "Results and numbers in your bullets.",
      metrics: [
        { label: "Bullets with a number", value: "3 of 9", percent: 33 },
        { label: "Strong action verbs", value: "5 of 9", percent: 56 },
      ],
      hint: "Six bullets describe tasks, not results.",
      evidence: [
        {
          text: "Led a team of developers on the checkout rebuild.",
          note: "No number",
          positive: false,
        },
        {
          text: "Improved the onboarding flow on mobile.",
          note: "Vague verb",
          positive: false,
        },
        {
          text: "Cut checkout steps from 5 to 3, lifting conversion 12%.",
          note: "Strong",
          positive: true,
        },
      ],
    },
    {
      key: "clarity",
      score: 86,
      previous: 80,
      projected: 94,
      description: "How easy each line is to read.",
      metrics: [
        { label: "Average bullet length", value: "14 words", percent: 70 },
        { label: "Passive voice", value: "1 line", percent: 10 },
      ],
      hint: '"Helped with" appears twice.',
      evidence: [
        {
          text: "Helped with the onboarding flow on mobile.",
          note: "Vague wording",
          positive: false,
        },
        {
          text: "Was responsible for payments design.",
          note: "Passive",
          positive: false,
        },
        {
          text: "Average bullet is 14 words",
          note: "Easy to scan",
          positive: true,
        },
      ],
    },
    {
      key: "relevance",
      score: 74,
      previous: 70,
      projected: 85,
      description: "Fit with Product Designer roles.",
      metrics: [
        { label: "Keywords found", value: "7 of 10", percent: 70 },
        { label: "Role seniority match", value: "Senior", percent: 80 },
      ],
      hint: "A/B testing and SQL are not mentioned.",
      evidence: [
        {
          text: "Skills: Figma, prototyping, user research",
          note: "Missing role keywords",
          positive: false,
        },
        {
          text: "Design systems appears twice",
          note: "Matches role",
          positive: true,
        },
      ],
    },
    {
      key: "completeness",
      score: 90,
      previous: 82,
      projected: 90,
      description: "Sections and dates all present.",
      metrics: [
        { label: "Sections present", value: "5 of 6", percent: 83 },
        { label: "Date gaps", value: "none", percent: 100 },
      ],
      hint: "No summary line at the top.",
      evidence: [
        {
          text: "No summary line at the top",
          note: "Add two sentences",
          positive: false,
        },
        { text: "Dates use one format", note: "Consistent", positive: true },
      ],
    },
  ],
  sections: [
    { name: "Contact", score: 100, note: "complete" },
    { name: "Education", score: 92, note: "complete" },
    { name: "Projects", score: 85, note: "2 strong bullets · 1 live link" },
    {
      name: "Experience",
      score: 70,
      note: "6 of 9 bullets lack a result · 3 roles",
    },
    {
      name: "Skills",
      score: 68,
      note: "missing A/B testing, SQL · 12 skills listed",
    },
    { name: "Summary", score: 62, note: "no summary line · add 2 sentences" },
  ],
  bullets: [
    {
      text: "Helped with the onboarding flow on mobile.",
      source: "Payly",
      strength: "weak",
      tags: ["Weak verb", "No number"],
    },
    {
      text: "Was responsible for payments design.",
      source: "Payly",
      strength: "weak",
      tags: ["Passive", "No result"],
    },
    {
      text: "Led a team of developers on the checkout rebuild.",
      source: "Payly",
      strength: "fair",
      tags: ["No number"],
    },
    {
      text: "Improved the onboarding flow on mobile.",
      source: "Payly",
      strength: "fair",
      tags: ["Vague verb"],
    },
    {
      text: "Ran usability tests with users.",
      source: "Kopi Studio",
      strength: "fair",
      tags: ["No count"],
    },
    {
      text: "Built a design system for the studio.",
      source: "Kopi Studio",
      strength: "fair",
      tags: ["No scale"],
    },
    {
      text: "Cut checkout steps from 5 to 3, lifting conversion 12%.",
      source: "Payly",
      strength: "strong",
      tags: ["Number", "Result"],
    },
    {
      text: "Designed 14 reusable components for 3 product teams.",
      source: "Payly",
      strength: "strong",
      tags: ["Number", "Scale"],
    },
    {
      text: "Reduced support tickets 18% through clearer error messages.",
      source: "Kopi Studio",
      strength: "strong",
      tags: ["Number", "Result"],
    },
  ],
  grammar: {
    spelling: 1,
    grammar: 3,
    style: 5,
    notes: [
      {
        before: "recieve",
        after: "receive",
        location: "Spelling · Experience",
      },
      {
        before: "team were",
        after: "team was",
        location: "Grammar · Experience",
      },
      { before: "very good", after: "strong", location: "Style · Summary" },
    ],
  },
  keywords: {
    total: 10,
    present: [
      { name: "Figma", count: 4 },
      { name: "Prototyping", count: 3 },
      { name: "User research", count: 5 },
      { name: "Design systems", count: 2 },
      { name: "Wireframes", count: 2 },
      { name: "Usability testing", count: 1 },
      { name: "Accessibility", count: 1 },
    ],
    missing: [
      { name: "A/B testing", posts: 8 },
      { name: "SQL", posts: 5 },
      { name: "Stakeholder management", posts: 6 },
    ],
  },
  ats: {
    score: 82,
    facts: ["PDF", "1 page", "212 KB", "fonts embedded", "text layer: yes"],
    checks: [
      { text: "Text is selectable, not an image", ok: true },
      { text: "Standard section headings", ok: true },
      { text: "Dates in one format", ok: true },
      { text: "No tables or text boxes", ok: true },
      { text: "File opens as clean text", ok: true },
      { text: "Two-column layout may be read out of order", ok: false },
    ],
  },
  versions: [
    {
      label: "v1",
      score: 71,
      at: "2026-10-12",
      summary: "First analysis. No numbers in bullets, no summary.",
    },
    {
      label: "v2",
      score: 77,
      at: "2026-11-14",
      summary: "Added 2 numbers, fixed 4 grammar notes. Score +6.",
    },
  ],
};
