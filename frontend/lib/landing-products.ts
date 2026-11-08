export const products = [
  {
    name: "CV Analyzer",
    status: "Live now",
    description:
      "Score your CV, find skill gaps, match it to a job and rewrite it line by line.",
    image: "cv-sheet",
    live: true,
  },
  {
    name: "CV Builder",
    status: "Coming soon",
    description:
      "Build a clean, ATS-friendly CV from scratch with guided sections.",
    image: "building-blocks",
    live: false,
  },
  {
    name: "Job Connect",
    status: "Coming soon",
    description:
      "Find roles that fit your CV and see how you match before you apply.",
    image: "briefcase",
    live: false,
  },
] as const;
