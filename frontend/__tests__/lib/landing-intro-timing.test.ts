import { describe, expect, it } from "vitest";
import { introTime, wordmarkWidth } from "@/lib/landing-intro-timing";

describe("landing intro timing", () => {
  it("finishes the morph before the curtain lifts", () => {
    expect(introTime.wordmark).toBeLessThan(introTime.expand);
    expect(introTime.expand).toBeLessThan(introTime.collapse);
    expect(introTime.collapse).toBeLessThan(introTime.exit);
    expect(introTime.exit + introTime.lift).toBeLessThan(5.5);
  });

  it("uses the measured width for each wordmark state", () => {
    expect(wordmarkWidth(320, 400)).toBe(320);
    expect(wordmarkWidth(500, 400)).toBe(400);
  });
});
