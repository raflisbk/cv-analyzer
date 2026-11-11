export interface CvSummary {
  jobId: string;
  fileName: string;
  targetRole: string | null;
  score: number | null;
  status: string;
  updatedAt: string;
  pages: number;
  wordCount: number;
}
