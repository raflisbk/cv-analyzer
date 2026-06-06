

export interface ErrorDetail {
  code: string;
  message: string;
  details?: Record<string, unknown>;
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
  result?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface BenchmarkResult {
  percentile: number;
  sample_size: number;
}

export interface ScoreResult {
  overall: number;
  clarity: number;
  impact: number;
  completeness: number;
  relevance: number;
  reasonings?: Record<string, string>;
  jd_relevance?: boolean;
  target_role?: string | null;
  benchmark?: BenchmarkResult;
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
  suggestions?: SuggestionCard[] | null;
  comparison_result?: ComparisonResult | null;
  comparison_status?: "pending" | "comparing" | "complete" | "failed" | null;
  parent_job_id?: string | null;
  version_history?: ScoreVersion[];
}

export const SUPPORTED_ROLES = [
  { id: "ml_engineer", label: "ML / AI Engineer" },
  { id: "data_scientist", label: "Data Scientist" },
  { id: "software_engineer", label: "Software Engineer" },
  { id: "data_engineer", label: "Data Engineer" },
  { id: "product_manager", label: "Product Manager" },
] as const;

export type RoleId = (typeof SUPPORTED_ROLES)[number]["id"];

export interface SkillGapItem {
  skill: string;
  priority: "high" | "medium" | "low";
  category: string;
  why_important: string;
  resources: Array<{ title: string; url: string }>;
}

export interface ScoreVersion {
  job_id: string;
  version: number;
  overall: number;
  created_at: string;
  delta: number | null;
}

export interface ComparisonResult {
  match_pct: number;
  matched_skills: string[];
  missing_skills: string[];
  matched_experience: string[];
  missing_experience: string[];
  overall_recommendation: string;
  skill_gaps?: SkillGapItem[];
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
