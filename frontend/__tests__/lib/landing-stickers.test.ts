import { describe, expect, it } from "vitest";
import { scoreBars } from "@/lib/landing-report";
import {
  demoMatch,
  demoRewrite,
  demoScores,
  demoTemplates,
} from "@/lib/landing-stickers";

describe("landing demo data", () => {
  it("uses the report score dimensions and source rewrite", () => {
    expect(demoScores).toEqual(scoreBars);
    expect(demoRewrite.before).toBe(
      "Led a team of developers on the checkout rebuild.",
    );
    expect(demoRewrite.after).toContain("cutting load time 40%");
  });

  it("shows evidence for each job requirement and PDF options", () => {
    expect(demoMatch.requirements.map(({ status }) => status)).toEqual([
      "Met",
      "Met",
      "Missing",
    ]);
    expect(
      demoMatch.requirements.every(({ evidence }) => evidence.length > 0),
    ).toBe(true);
    expect(demoTemplates).toHaveLength(3);
  });
});
