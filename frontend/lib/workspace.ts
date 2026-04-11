import { apiFetch } from "@/lib/api";
import type {
  AtsCheck,
  ComparisonResult,
  ScoreResult,
  SectionResult,
  SuggestionCard,
} from "@/lib/types";

export interface WorkspaceFileInfo {
  filename: string | null;
  mime_type: string | null;
  size?: number | null;
  extension?: string | null;
}

export interface WorkspaceDocumentPayload {
  source_text: string | null;
  sections: SectionResult[];
}

export interface WorkspaceAnalysisContext {
  scores: ScoreResult | null;
  ats_checks: AtsCheck[];
  suggestions?: SuggestionCard[] | null;
  comparison_result?: ComparisonResult | null;
  comparison_status?: "pending" | "comparing" | "complete" | "failed" | null;
}

export interface WorkspaceNavigation {
  workspace_url: string;
  results_url: string;
}

export interface WorkspaceHydration {
  job_id: string;
  status: "preparing" | "ready" | "failed";
  file: WorkspaceFileInfo;
  document: WorkspaceDocumentPayload;
  analysis: WorkspaceAnalysisContext;
  navigation: WorkspaceNavigation;
  error?: string | null;
}

export async function getWorkspaceHydration(
  jobId: string
): Promise<WorkspaceHydration> {
  return apiFetch<WorkspaceHydration>(`/jobs/${jobId}/workspace`);
}
