import type { PathyPose } from "./pose";

export const HELP_KEYS = [
  "home",
  "cvs",
  "reports",
  "views",
  "editor",
  "paneReport",
  "paneFixes",
  "ats",
  "match",
  "chat",
  "grammarTab",
  "historyTab",
  "verdict",
  "overall",
  "radar",
  "fixesCard",
  "dims",
  "sections",
  "bullets",
  "grammar",
  "keywords",
  "atsCard",
  "history",
  "exportHelp",
  "exAts",
] as const;
export type HelpKey = (typeof HELP_KEYS)[number];
export interface HelpContent {
  pose: PathyPose;
  title: string;
  text: string;
}

export const HELP: Record<HelpKey, HelpContent> = {
  home: {
    pose: "hello",
    title: "Ask anything",
    text: "Ask about your CV or your career. Upload a CV and my answers use your own numbers.",
  },
  cvs: {
    pose: "map",
    title: "My CVs",
    text: "Every file you uploaded. Report opens the scores, Edit opens the editor.",
  },
  reports: {
    pose: "proud",
    title: "Reports",
    text: "One report per CV version. Compare scores and see what changed.",
  },
  views: {
    pose: "map",
    title: "Three views",
    text: "Editor changes the text, PDF shows the original, Full report shows every score.",
  },
  editor: {
    pose: "idea",
    title: "Edit inline",
    text: "Select text and ask AI to rewrite it. Yellow lines are suggestions you can accept.",
  },
  paneReport: {
    pose: "proud",
    title: "Report tab",
    text: "The short version of your scores. Open Full report for charts and evidence.",
  },
  paneFixes: {
    pose: "idea",
    title: "Suggested fixes",
    text: "Each fix shows where it applies. Apply writes it into your CV.",
  },
  ats: {
    pose: "detective",
    title: "ATS check",
    text: "See what automated screening software can and cannot read.",
  },
  match: {
    pose: "map",
    title: "Job match",
    text: "Paste a job post to compare skills, experience, and keywords with your CV.",
  },
  chat: {
    pose: "helpdesk",
    title: "CV chat",
    text: "Ask about this CV. Answers can point you to the document.",
  },
  grammarTab: {
    pose: "surprised",
    title: "Grammar tab",
    text: "Accept or ignore each note. Accepting writes the fix into your CV.",
  },
  historyTab: {
    pose: "think",
    title: "Version history",
    text: "Compare changes or restore an older version.",
  },
  verdict: {
    pose: "proud",
    title: "The verdict",
    text: "A plain-language summary and your best next steps.",
  },
  overall: {
    pose: "trophy",
    title: "Overall score",
    text: "Impact 35%, Clarity 30%, Relevance 20%, Completeness 15%.",
  },
  radar: {
    pose: "detective",
    title: "Shape of your CV",
    text: "Compare your four scores with earlier versions or a role average.",
  },
  fixesCard: {
    pose: "idea",
    title: "If you apply the fixes",
    text: "See today's score and the possible improvement from open fixes.",
  },
  dims: {
    pose: "detective",
    title: "The four scores",
    text: "Open Evidence to see the lines behind each score.",
  },
  sections: {
    pose: "map",
    title: "Section by section",
    text: "Click a row to jump to that section in the editor.",
  },
  bullets: {
    pose: "idea",
    title: "All bullets",
    text: "Strong bullets have a verb, a number, and a result.",
  },
  grammar: {
    pose: "surprised",
    title: "Grammar and style",
    text: "Spelling and grammar are worth fixing. Style notes are optional.",
  },
  keywords: {
    pose: "idea",
    title: "Keywords",
    text: "Words real job posts ask for. Add only skills you actually have.",
  },
  atsCard: {
    pose: "detective",
    title: "ATS readiness",
    text: "See how well automated systems can read your file.",
  },
  history: {
    pose: "proud",
    title: "Score history",
    text: "Each analysis adds a point. The dotted line shows what open fixes might add.",
  },
  exportHelp: {
    pose: "helpdesk",
    title: "Export",
    text: "Keep the original layout or pick an ATS template.",
  },
  exAts: {
    pose: "detective",
    title: "ATS score of a template",
    text: "Warnings explain what can go wrong when automated systems read this layout.",
  },
};
