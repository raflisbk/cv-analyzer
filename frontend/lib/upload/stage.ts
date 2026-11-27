const STAGE_MAP: Record<string, string> = {
  uploading: "uploading",
  extracting: "extracting",
  validating: "extracting",
  parsing: "extracting",
  analyzing: "analyzing",
  analyzing_sections: "analyzing",
  extracting_skills: "analyzing",
  scoring: "analyzing",
  grammar: "analyzing",
  grammar_check: "analyzing",
  generating: "generating",
  suggesting: "generating",
  generating_suggestions: "generating",
  comparing: "comparing",
  comparing_job: "comparing",
  complete: "complete",
};

export function toUiStage(backendStage: string, fallback = "uploading") {
  return STAGE_MAP[backendStage] ?? fallback;
}
