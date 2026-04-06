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

// ============================================================
// Phase 3: AI Suggestion types (per LLM-01..04, D-06, D-08)
// ============================================================

export type SuggestionPriority = "high_impact" | "quick_win";
export type SuggestionType = "action_verb" | "impact_metric" | "missing_section";

export interface SuggestionItem {
  priority: SuggestionPriority;
  text: string;
  type: SuggestionType;
}

export interface SuggestionCard {
  section: string; // e.g. "Experience", "Skills", "Summary"
  suggestions: SuggestionItem[];
}

export interface AnalysisResult {
  job_id: string;
  status:
    | "pending"
    | "uploading"
    | "extracting"
    | "parsing"
    | "analyzing"
    | "generating" // Phase 3: LLM suggestion generation stage (D-19)
    | "complete"
    | "failed";
  scores: ScoreResult | null;
  sections: SectionResult[];
  skills: string[];
  grammar_issues: GrammarIssue[];
  ats_checks: AtsCheck[];
  // Phase 3: AI suggestions (D-20)
  // undefined = pre-Phase 3 job (field absent in DB) → render nothing
  // null      = LLM failed (ERROR-02, D-17) → render "unavailable" state
  // []        = LLM succeeded, nothing to suggest → render "no suggestions" state
  // [...]     = populated suggestions → render suggestion cards
  suggestions?: SuggestionCard[] | null;
}
