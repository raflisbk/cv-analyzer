import { apiFetch } from "@/lib/api";
import type { JSONContent } from "@tiptap/core";
import type {
  AtsCheck,
  ComparisonResult,
  ScoreResult,
  SectionResult,
  SuggestionCard,
  GrammarIssue,
} from "@/lib/types";
import type { ChatMessage } from "@/lib/stores/workspace-v2-store";

export interface AnchorRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SuggestionAnchorRecord {
  suggestion_id: string;
  section: string;
  text_anchor: string;
  page_index: number;
  rect: AnchorRect;
  priority: "high_impact" | "quick_win";
}

export interface WorkspaceFileInfo {
  filename: string | null;
  mime_type: string | null;
  size?: number | null;
  extension?: string | null;
}

export interface WorkspaceDocumentPayload {
  source_text: string | null;
  sections: SectionResult[];
  draft_content?: Record<string, JSONContent> | null;
}

export interface WorkspaceAnalysisContext {
  scores: ScoreResult | null;
  ats_checks: AtsCheck[];
  suggestions?: SuggestionCard[] | null;
  skills?: string[];
  grammar_issues?: GrammarIssue[];
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
  suggestion_anchors?: SuggestionAnchorRecord[];
  messages?: ChatMessage[];
}

export async function getWorkspaceHydration(
  jobId: string
): Promise<WorkspaceHydration> {
  return apiFetch<WorkspaceHydration>(`/jobs/${jobId}/workspace`);
}

export interface WorkspaceFileUrl {
  file_url: string;
  expires_in: number;
}

export async function getJobFileUrl(jobId: string): Promise<WorkspaceFileUrl> {
  return apiFetch<WorkspaceFileUrl>(`/jobs/${jobId}/file`);
}