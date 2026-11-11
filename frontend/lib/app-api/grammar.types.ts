export interface GrammarData {
  stats: {
    readingGrade: number;
    wordsPerSentence: number;
    passiveLines: number;
    tone: string;
  };
  notes: {
    id: string;
    type: "spelling" | "grammar" | "style";
    location: string;
    before: string;
    after: string;
  }[];
}
