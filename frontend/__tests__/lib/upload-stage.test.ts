import { describe, expect, it } from "vitest";
import { resolveStep, stageMessageKey, toUiStage } from "@/lib/upload/stage";

const REAL_STAGES: [string, number, string][] = [
  ["extracting", 0, "extracting"],
  ["validating", 0, "extracting"],
  ["parsing", 0, "extracting"],
  ["analyzing_sections", 1, "analyzing"],
  ["extracting_skills", 1, "analyzing"],
  ["detecting_archetype", 1, "analyzing"],
  ["scoring", 2, "analyzing"],
  ["grammar_check", 3, "analyzing"],
  ["generating_suggestions", 4, "generating"],
  ["indexing_cv", 4, "generating"],
  ["preparing_results", 4, "generating"],
  ["complete", 5, "complete"],
];

describe("upload stage table", () => {
  it.each(REAL_STAGES)("maps %s to step %i and ui %s", (stage, step, ui) => {
    expect(resolveStep(stage, undefined, 99)).toBe(step);
    expect(toUiStage(stage)).toBe(ui);
  });

  it("prefers the step carried by the payload", () => {
    expect(resolveStep("scoring", 3, 0)).toBe(3);
    expect(resolveStep("anything_new", 4, 0)).toBe(4);
  });

  it("keeps the previous step for unknown names and failures", () => {
    expect(resolveStep("brand_new_stage", undefined, 3)).toBe(3);
    expect(resolveStep("failed", undefined, 2)).toBe(2);
  });

  it("keeps the previous step for stages without a step", () => {
    expect(resolveStep("comparing_job", undefined, 4)).toBe(4);
  });

  it("uses dedicated message keys for the long silent phase", () => {
    expect(stageMessageKey("indexing_cv")).toBe("indexing_cv");
    expect(stageMessageKey("preparing_results")).toBe("preparing_results");
    expect(stageMessageKey("detecting_archetype")).toBe("detecting_archetype");
    expect(stageMessageKey("scoring")).toBe("analyzing");
  });

  it("falls back for unknown message keys", () => {
    expect(stageMessageKey("mystery")).toBe("analyzing");
    expect(toUiStage("mystery")).toBe("uploading");
    expect(toUiStage("mystery", "analyzing")).toBe("analyzing");
  });
});
