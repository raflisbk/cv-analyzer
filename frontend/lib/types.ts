/**
 * API response types matching backend wrapped response format
 * from RESEARCH.md Pattern 1: Wrapped Response Format
 */

export interface ErrorDetail {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ResponseMeta {
  request_id: string;
  timestamp: string;
}

export interface WrappedResponse<T> {
  data?: T;
  error?: ErrorDetail;
  meta: ResponseMeta;
}

export enum JobStatus {
  PENDING = "pending",
  UPLOADING = "uploading",
  EXTRACTING = "extracting",
  PARSING = "parsing",
  ANALYZING = "analyzing",
  COMPLETE = "complete",
  FAILED = "failed"
}

export interface Job {
  id: string;
  status: JobStatus;
  file_id: string;
  stages: Record<string, boolean>;
  error?: string;
  retry_count: number;
  metadata: {
    filename: string;
    size: number;
    mime_type: string;
  };
  result?: any;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Phase 2: Analysis Result types (per D-23)
// ============================================================

export interface ScoreResult {
  overall: number;
  clarity: number;
  impact: number;
  completeness: number;
  relevance: number;
}

export interface SectionResult {
  type: string;
  text: string;
  entities: Array<{ text: string; label: string; type: string }>;
}

export interface GrammarIssue {
  text: string;
  offset: number;
  suggestion: string;
  rule: string;
}

export interface AtsCheck {
  check: string;
  status: "pass" | "warn" | "fail";
  detail?: string;
}

export interface AnalysisResult {
  job_id: string;
  status:
    | "pending"
    | "uploading"
    | "extracting"
    | "parsing"
    | "analyzing"
    | "complete"
    | "failed";
  scores: ScoreResult | null;
  sections: SectionResult[];
  skills: string[];
  grammar_issues: GrammarIssue[];
  ats_checks: AtsCheck[];
}
