import type { AtsData } from "../ats.types";

export const atsFixture: AtsData = {
  score: 82,
  summary: "Most systems read this CV well. One layout issue costs 18 points.",
  compat: [
    { system: "Workday", rating: 5 },
    { system: "Greenhouse", rating: 5 },
    { system: "Lever", rating: 4 },
    { system: "Taleo", rating: 3 },
    { system: "iCIMS", rating: 4 },
  ],
  parsed: [
    { field: "Name", value: "Samuel Samdono", confidence: 100 },
    { field: "Email, phone", value: "2 found", confidence: 100 },
    { field: "Job titles", value: "2 found", confidence: 90 },
    { field: "Dates", value: "4 of 4", confidence: 100 },
    { field: "Skills", value: "12 found", confidence: 75 },
    { field: "Education", value: "1 found", confidence: 100 },
  ],
  plainText: {
    lines: [
      { text: "SAMUEL SAMDONO", flagged: false },
      { text: "Product Designer · Jakarta", flagged: false },
      { text: "SKILLS Figma, prototyping…", flagged: true },
      { text: "EDUCATION BA Visual Comm…", flagged: true },
      { text: "EXPERIENCE", flagged: false },
      { text: "Senior Product Designer · Payly", flagged: false },
    ],
    note: "Skills and Education are read before Experience because the sidebar is a second column.",
  },
  checks: [
    {
      group: "Format",
      label: "Text is selectable, not an image",
      status: "pass",
    },
    { group: "Format", label: "Fonts are embedded", status: "pass" },
    { group: "Format", label: "No tables or text boxes", status: "pass" },
    { group: "Format", label: "Standard page size", status: "pass" },
    { group: "Format", label: "File size 212 KB", status: "pass" },
    {
      group: "Format",
      label: "Two-column layout may be read out of order",
      status: "warn",
    },
    { group: "Content", label: "Standard section headings", status: "pass" },
    { group: "Content", label: "Dates in one format", status: "pass" },
    {
      group: "Keywords",
      label: "7 of 10 role keywords present",
      status: "warn",
    },
  ],
  hiddenText: { found: false, items: [] },
};
