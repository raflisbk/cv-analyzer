import { scoreBars } from "@/lib/landing-report";

export type ScoreDemoStage =
  | "idle"
  | "counting"
  | "flagged"
  | "struck"
  | "rewritten"
  | "improved";

export type ScoreDemoEvent =
  | "enter"
  | "counted"
  | "accept"
  | "rewrite"
  | "improve"
  | "undo";

const next: Record<
  ScoreDemoStage,
  Partial<Record<ScoreDemoEvent, ScoreDemoStage>>
> = {
  idle: { enter: "counting" },
  counting: { counted: "flagged" },
  flagged: { accept: "struck" },
  struck: { rewrite: "rewritten", undo: "flagged" },
  rewritten: { improve: "improved", undo: "flagged" },
  improved: { undo: "flagged" },
};

export function scoreDemoReducer(
  stage: ScoreDemoStage,
  event: ScoreDemoEvent,
): ScoreDemoStage {
  return next[stage][event] ?? stage;
}

export const scoreWeights = [0.35, 0.3, 0.2, 0.15] as const;

export function weightedScore(values: readonly number[]): number {
  return Math.round(
    values.reduce((sum, value, index) => sum + value * scoreWeights[index], 0),
  );
}

export const beforeScore = weightedScore(scoreBars.map((bar) => bar.before));
export const afterScore = weightedScore(scoreBars.map((bar) => bar.value));
