export type Insight = {
  key: string;
  eyebrow: string;
  title: string;
  chip: string;
  target: string;
  object: string;
  mode?: "ats" | "match" | "edit" | "gap";
  body:
    | { kind: "intro"; text: string; labels: string[] }
    | { kind: "checks"; items: string[] }
    | {
        kind: "match";
        percent: number;
        text: string;
        keywords: string[];
        missing: string[];
      }
    | { kind: "bars"; rows: { label: string; value: string; width: number }[] }
    | { kind: "edit"; before: string; after: string; actions: string[] };
};

export const laptopInsights: Insight[] = [
  {
    key: "intro",
    eyebrow: "Open your CV",
    title: "Ten sections, ten insights",
    chip: "",
    target: "",
    object: "",
    body: {
      kind: "intro",
      text: "Samuel's CV, opened up. Every section is read, rated and explained. Follow the highlights.",
      labels: ["Contact", "Summary", "Experience", "Skills", "More"],
    },
  },
  {
    key: "contact",
    eyebrow: "Contact",
    title: "Easy to reach",
    chip: "Contact 100%",
    target: "[data-sc-section='contact']",
    object: "shield",
    mode: "ats",
    body: {
      kind: "checks",
      items: ["Email found", "Phone found", "LinkedIn found", "Location found"],
    },
  },
  {
    key: "summary",
    eyebrow: "Summary",
    title: "Short and on target",
    chip: "Match 78%",
    target: "[data-sc-section='summary']",
    object: "target",
    mode: "match",
    body: {
      kind: "match",
      percent: 78,
      text: "3 of 5 job keywords appear here",
      keywords: ["checkout", "onboarding", "fintech"],
      missing: ["SQL", "analytics"],
    },
  },
  {
    key: "payly",
    eyebrow: "Experience · Payly",
    title: "Strong role, thin proof",
    chip: "Impact 62",
    target: "[data-sc-section='payly']",
    object: "chart",
    body: {
      kind: "bars",
      rows: [
        { label: "Action verbs", value: "3 / 3", width: 100 },
        { label: "Numbers in bullets", value: "1 / 3", width: 33 },
        { label: "Passive phrases", value: "0", width: 100 },
      ],
    },
  },
  {
    key: "edit",
    eyebrow: "Smart editor",
    title: "Fix it line by line",
    chip: "+40% clearer · Impact 62 to 84",
    target: "[data-sc-section='edit']",
    object: "pencil",
    mode: "edit",
    body: {
      kind: "edit",
      before: "Led a team of developers on the checkout rebuild.",
      after: "Led 6 engineers on the checkout rebuild, cutting load time 40%.",
      actions: ["Accept", "Undo", "Reword"],
    },
  },
  {
    key: "brightly",
    eyebrow: "Experience · Brightly",
    title: "Older role, still useful",
    chip: "Impact 70",
    target: "[data-sc-section='brightly']",
    object: "podium",
    body: {
      kind: "bars",
      rows: [
        { label: "Action verbs", value: "2 / 2", width: 100 },
        { label: "Numbers in bullets", value: "1 / 2", width: 50 },
        { label: "Gap between roles", value: "none", width: 100 },
      ],
    },
  },
  {
    key: "projects",
    eyebrow: "Projects",
    title: "Proof that sells",
    chip: "Strong section",
    target: "[data-sc-section='projects']",
    object: "rocket",
    body: {
      kind: "checks",
      items: [
        "Result with a number found",
        "Link to a case study found",
        "Onboarding matches the job",
      ],
    },
  },
  {
    key: "education",
    eyebrow: "Education",
    title: "Clear and complete",
    chip: "All good",
    target: "[data-sc-section='education']",
    object: "star",
    body: {
      kind: "checks",
      items: [
        "Degree and year found",
        "Dates in a standard format",
        "No GPA needed after 5 years",
      ],
    },
  },
  {
    key: "skills",
    eyebrow: "Skills",
    title: "Two gaps to close",
    chip: "2 gaps found",
    target: "[data-sc-section='skills']",
    object: "magnifier",
    mode: "gap",
    body: {
      kind: "bars",
      rows: [
        { label: "SQL", value: "Required · 3 mentions", width: 86 },
        { label: "A/B testing", value: "Required · 2 mentions", width: 64 },
        { label: "Analytics", value: "Nice to have", width: 34 },
      ],
    },
  },
  {
    key: "certs",
    eyebrow: "Certifications",
    title: "Relevant and recent",
    chip: "+4 relevance",
    target: "[data-sc-section='certs']",
    object: "trophy",
    body: {
      kind: "checks",
      items: [
        "Google UX Design Certificate, 2022",
        "Matches UX in the job post",
        "Recent: under 4 years old",
      ],
    },
  },
  {
    key: "lang",
    eyebrow: "Languages",
    title: "Matches the job",
    chip: "2 languages",
    target: "[data-sc-section='lang']",
    object: "speech-bubbles",
    body: {
      kind: "checks",
      items: [
        "English fluent, same as the post",
        "Indonesian native",
        "No translation needed",
      ],
    },
  },
];
