import { describe, expect, it } from "vitest";
import { scoreBars } from "@/lib/landing-report";
import {
  afterScore,
  beforeScore,
  scoreDemoReducer,
  scoreWeights,
  weightedScore,
} from "@/lib/landing-score-demo";

describe("landing score story", () => {
  it("calculates both scores from the same weighted bars", () => {
    expect(scoreWeights).toEqual([0.35, 0.3, 0.2, 0.15]);
    expect(scoreBars.map((bar) => bar.before)).toEqual([70, 90, 82, 94]);
    expect(scoreBars.map((bar) => bar.value)).toEqual([82, 90, 82, 94]);
    expect(beforeScore).toBe(82);
    expect(afterScore).toBe(86);
    expect(weightedScore(scoreBars.map((bar) => bar.before))).toBe(beforeScore);
    expect(weightedScore(scoreBars.map((bar) => bar.value))).toBe(afterScore);
  });

  it("moves through the accepted rewrite and supports undo", () => {
    let stage = scoreDemoReducer("idle", "enter");
    expect(stage).toBe("counting");
    stage = scoreDemoReducer(stage, "counted");
    expect(stage).toBe("flagged");
    stage = scoreDemoReducer(stage, "accept");
    expect(stage).toBe("struck");
    stage = scoreDemoReducer(stage, "rewrite");
    expect(stage).toBe("rewritten");
    stage = scoreDemoReducer(stage, "improve");
    expect(stage).toBe("improved");
    expect(scoreDemoReducer(stage, "accept")).toBe("improved");
    expect(scoreDemoReducer(stage, "undo")).toBe("flagged");
  });
});
