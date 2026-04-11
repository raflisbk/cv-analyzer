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
  originalText?: string;  // Original CV text for before/after comparison
  afterText?: string;     // Rewritten example implementing the suggestion
}

/**
 * API-facing suggestion item shape before UI normalization.
 * Backend may emit `original_text`/`after_text` while frontend components consume camelCase.
 */
export interface ApiSuggestionItem extends Omit<SuggestionItem, "originalText" | "afterText"> {
  originalText?: string;
  original_text?: string;
  afterText?: string;
  after_text?: string;
}

/** API-facing suggestion card shape before UI normalization. */
export interface ApiSuggestionCard {
  section: string;
  suggestions: ApiSuggestionItem[];
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
    | "comparing"  // Phase 4: comparison task running (D-C9)
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
  // Phase 4: Comparison data per D-C9
  // undefined = comparison not triggered
  // null      = comparison failed
  // ComparisonResult = comparison complete
  comparison_result?: ComparisonResult | null;
  comparison_status?: "pending" | "comparing" | "complete" | "failed" | null;
}

// ============================================================
// Phase 4: Comparison types (per D-C6, D-C9, COMPARE-03..06)
// ============================================================

/** LLM comparison output per D-C6. Fields match backend ComparisonResult Pydantic schema. */
export interface ComparisonResult {
  match_pct: number;              // 0–100 integer
  matched_skills: string[];
  missing_skills: string[];
  matched_experience: string[];
  missing_experience: string[];
  overall_recommendation: string;
}

/** Skills grouped by gap status for SkillsGapDisplay per COMPARE-05, UX-01. */
export interface SkillGapGroup {
  present: string[];    // from matched_skills
  missing: string[];    // from missing_skills
  partial: string[];    // optional partial matches
}

/** Job role summary for comparison dropdown per D-C5, COMPARE-02. */
export interface JobRole {
  id: string;
  title: string;
  seniority: "junior" | "mid" | "senior";
  industry: string;
}

/** Export options for ExportStickyBar per D-C12, EXPORT-01, EXPORT-02. */
export interface ExportOptions {
  jobId: string;
  topSuggestionText?: string;  // For clipboard copy via navigator.clipboard.writeText()
}
