import type { GrammarData } from "../grammar.types";

export const grammarFixture: GrammarData = {
  stats: {
    readingGrade: 9,
    wordsPerSentence: 14,
    passiveLines: 1,
    tone: "Confident",
  },
  notes: [
    {
      id: "g1",
      type: "spelling",
      location: "Experience",
      before: "recieve",
      after: "receive",
    },
    {
      id: "g2",
      type: "grammar",
      location: "Experience",
      before: "team were",
      after: "team was",
    },
    {
      id: "g3",
      type: "grammar",
      location: "Projects",
      before: "less users",
      after: "fewer users",
    },
    {
      id: "g4",
      type: "grammar",
      location: "Summary",
      before: "affect on conversion",
      after: "effect on conversion",
    },
    {
      id: "g5",
      type: "style",
      location: "Experience",
      before: "very good",
      after: "strong",
    },
    {
      id: "g6",
      type: "style",
      location: "Experience",
      before: "responsible for",
      after: "owned",
    },
    {
      id: "g7",
      type: "style",
      location: "Skills",
      before: "various tools",
      after: "specific tools you use",
    },
  ],
};
