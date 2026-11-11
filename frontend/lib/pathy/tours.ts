import type { PathyPose } from "./pose";

export interface TourStep {
  path: string;
  target: string;
  pose: PathyPose;
  title: string;
  text: string;
}
export const TOURS: Record<string, TourStep[]> = {
  full: [
    {
      path: "/app",
      target: "home-composer",
      pose: "hello",
      title: "Hi, I'm Pathy",
      text: "Ask about your CV or career here. Upload a CV for personal answers.",
    },
    {
      path: "/app",
      target: "main-nav",
      pose: "map",
      title: "Three places to go",
      text: "Chat is for questions. My CVs lists your files. Reports shows every score.",
    },
    {
      path: "/app",
      target: "account",
      pose: "guide",
      title: "Your account",
      text: "Open it for My CVs, Settings and Log out.",
    },
    {
      path: "/app/cvs",
      target: "cv-card",
      pose: "think",
      title: "Every CV lives here",
      text: "Report opens the scores. Edit opens the editor.",
    },
    {
      path: "/app/reports",
      target: "report-card",
      pose: "proud",
      title: "One report per version",
      text: "Four scores, the top fix, and how you changed.",
    },
    {
      path: "/app/cvs/:jobId?view=report",
      target: "report-nav",
      pose: "detective",
      title: "The full report",
      text: "Jump between sections and open evidence on any score.",
    },
    {
      path: "/app/cvs/:jobId?view=editor",
      target: "workspace-editor",
      pose: "idea",
      title: "Edit right in the text",
      text: "Select text and ask AI. Yellow highlights are suggestions.",
    },
    {
      path: "/app/cvs/:jobId?view=editor",
      target: "workspace-export",
      pose: "trophy",
      title: "Export with an ATS template",
      text: "Pick a template and preview before export.",
    },
  ],
  export: [
    {
      path: "/app/cvs/:jobId?view=editor",
      target: "workspace-export",
      pose: "cheer",
      title: "Export is here",
      text: "Pick an ATS template and check the preview.",
    },
  ],
  score: [
    {
      path: "/app/cvs/:jobId?view=report",
      target: "report-scores",
      pose: "think",
      title: "What the score means",
      text: "Impact 35%, Clarity 30%, Relevance 20%, Completeness 15%.",
    },
  ],
};
