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

// Phase 14: Suggestion anchor coordinate types (mirror of backend/app/schemas/anchors.py)
export interface AnchorRect {
  x: number;  // PDF points, left edge (top-left origin, y-down - CSS-compatible)
  y: number;  // PDF points, top edge
  w: number;  // width in PDF points
  h: number;  // height in PDF points
}

export interface SuggestionAnchorRecord {
  suggestion_id: string;  // deterministic: "{section}_{item_idx}_{card_idx}"
  section: string;
  text_anchor: string;
  page_index: number;   // 0-indexed
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
  draft_content?: Record<string, JSONContent> | null; // Phase 12: per-section Tiptap JSON draft
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
  suggestion_anchors?: SuggestionAnchorRecord[];  // Phase 14: ANNOT-04; empty for pre-Phase-14 jobs
}

export async function getWorkspaceHydration(
  jobId: string
): Promise<WorkspaceHydration> {
  return apiFetch<WorkspaceHydration>(`/jobs/${jobId}/workspace`);
}

// Phase 13: file presigned URL fetch (PDF-02)
export interface WorkspaceFileUrl {
  file_url: string;
  expires_in: number;
}

export async function getJobFileUrl(jobId: string): Promise<WorkspaceFileUrl> {
  return apiFetch<WorkspaceFileUrl>(`/jobs/${jobId}/file`);
}