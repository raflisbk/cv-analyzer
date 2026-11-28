interface StageInfo {
  step?: number;
  ui: string;
  message?: string;
}

const STAGES: Record<string, StageInfo> = {
  uploading: { step: 0, ui: "uploading" },
  extracting: { step: 0, ui: "extracting" },
  validating: { step: 0, ui: "extracting" },
  parsing: { step: 0, ui: "extracting" },
  analyzing: { step: 1, ui: "analyzing" },
  analyzing_sections: { step: 1, ui: "analyzing" },
  extracting_skills: { step: 1, ui: "analyzing" },
  detecting_archetype: {
    step: 1,
    ui: "analyzing",
    message: "detecting_archetype",
  },
  scoring: { step: 2, ui: "analyzing" },
  grammar: { step: 3, ui: "analyzing" },
  grammar_check: { step: 3, ui: "analyzing" },
  generating: { step: 4, ui: "generating" },
  suggesting: { step: 4, ui: "generating" },
  generating_suggestions: { step: 4, ui: "generating" },
  indexing_cv: { step: 4, ui: "generating", message: "indexing_cv" },
  preparing_results: {
    step: 4,
    ui: "generating",
    message: "preparing_results",
  },
  comparing: { ui: "comparing" },
  comparing_job: { ui: "comparing" },
  complete: { step: 5, ui: "complete" },
};

export function toUiStage(backendStage: string, fallback = "uploading") {
  return STAGES[backendStage]?.ui ?? fallback;
}

export function stageMessageKey(backendStage: string, fallback = "analyzing") {
  const info = STAGES[backendStage];
  return info ? (info.message ?? info.ui) : fallback;
}

export function resolveStep(
  backendStage: string,
  payloadStep: number | undefined,
  previous: number,
) {
  if (typeof payloadStep === "number") {
    return payloadStep;
  }
  return STAGES[backendStage]?.step ?? previous;
}
