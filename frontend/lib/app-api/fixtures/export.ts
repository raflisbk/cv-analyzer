import type { ExportPreview, ExportTemplate } from "../export.types";

export const exportTemplates: ExportTemplate[] = [
  {
    id: "original",
    name: "Your original",
    description: "Same layout as your upload. Only the fixed lines change.",
    atsScore: 82,
    original: true,
    traits: ["Your upload", "Standard section headings", "Selectable text"],
  },
  {
    id: "plain",
    name: "Plain",
    description: "Strict parsers and big employers",
    atsScore: 99,
    original: false,
    traits: ["Single column", "Standard headings", "No tables"],
  },
  {
    id: "classic",
    name: "Classic",
    description: "Finance, law, academic roles",
    atsScore: 97,
    original: false,
    traits: ["Single column", "Traditional typography", "No tables"],
  },
  {
    id: "modern",
    name: "Modern",
    description: "Startups and design roles",
    atsScore: 94,
    original: false,
    traits: ["Single column", "Clear hierarchy", "Selectable text"],
  },
  {
    id: "compact",
    name: "Compact",
    description: "Long careers that must fit one page",
    atsScore: 91,
    original: false,
    traits: ["Single column", "Compact spacing", "Standard headings"],
  },
  {
    id: "executive",
    name: "Executive",
    description: "Senior and leadership roles",
    atsScore: 96,
    original: false,
    traits: ["Single column", "Executive summary", "No tables"],
  },
];

export const exportPreview: ExportPreview = {
  fileName: "Samuel_CV_2026.pdf",
  originalText:
    "Samuel Samdono\nProduct Designer\nContact\nJakarta · samuel@example.com · +62 812 0000 0000\nSkills\nFigma, prototyping, user research, design systems\nEducation\nBA Visual Communication · 2017\nExperience\nSenior Product Designer · Payly | 2022 – now\nLed a team of developers on the checkout rebuild.\nImproved the onboarding flow on mobile.\nBuilt a design system used by 4 squads.\nProduct Designer · Kopi Studio | 2019 – 2022\nShipped 12 client apps in 3 years with a team of 3.\nRan usability tests with 40+ users.",
  editedText:
    "Samuel Samdono\nProduct Designer\nContact\nJakarta · samuel@example.com · +62 812 0000 0000\nSkills\nFigma, prototyping, user research, design systems\nEducation\nBA Visual Communication · 2017\nExperience\nSenior Product Designer · Payly | 2022 – now\nLed a team of developers on the checkout rebuild.\nImproved mobile onboarding flow.\nBuilt a design system used by 4 squads.\nProduct Designer · Kopi Studio | 2019 – 2022\nShipped 12 client apps in 3 years with a team of 3.\nRan usability tests with 40+ users.",
};

export function mockExportPdf(): Blob {
  return new Blob(["%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF"], {
    type: "application/pdf",
  });
}
