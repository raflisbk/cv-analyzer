

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
// Analysis result types
// ============================================================

export interface ScoreResult {
  overall: number;
  clarity: number;
  impact: number;
  completeness: number;
  relevance: number;
  reasonings?: Record<string, string>;
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
// AI Suggestion types
// ============================================================

export type SuggestionPriority = "high_impact" | "quick_win";
export type SuggestionType = "action_verb" | "impact_metric" | "missing_section";

export interface SuggestionItem {
  priority: SuggestionPriority;
  text: string;
  explanation?: string;
  type: SuggestionType;
  originalText?: string;
  afterText?: string;
}

export interface ApiSuggestionItem extends Omit<SuggestionItem, "originalText" | "afterText"> {
  originalText?: string;
  original_text?: string;
  afterText?: string;
  after_text?: string;
  explanation?: string;
}

export interface ApiSuggestionCard {
  section: string;
  suggestions: ApiSuggestionItem[];
}

export interface SuggestionCard {
  section: string;
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
    | "generating"
    | "comparing"
    | "complete"
    | "failed";
  scores: ScoreResult | null;
  sections: SectionResult[];
  skills: string[];
  grammar_issues: GrammarIssue[];
  ats_checks: AtsCheck[];
  // AI suggestions
  // undefined = field absent in DB → render nothing
  // null      = LLM failed → render "unavailable" state
  // []        = LLM succeeded, nothing to suggest → render "no suggestions" state
  // [...]     = populated suggestions → render suggestion cards
  suggestions?: SuggestionCard[] | null;
  // Comparison data
  // undefined = comparison not triggered
  // null      = comparison failed
  // ComparisonResult = comparison complete
  comparison_result?: ComparisonResult | null;
  comparison_status?: "pending" | "comparing" | "complete" | "failed" | null;
}

// ============================================================
// Comparison types
// ============================================================

export interface ComparisonResult {
  match_pct: number;
  matched_skills: string[];
  missing_skills: string[];
  matched_experience: string[];
  missing_experience: string[];
  overall_recommendation: string;
}

export interface SkillGapGroup {
  present: string[];
  missing: string[];
  partial: string[];
}

export interface JobRole {
  id: string;
  title: string;
  seniority: "junior" | "mid" | "senior";
  industry: string;
}

export interface ExportOptions {
  jobId: string;
  topSuggestionText?: string;
}
