import { describe, expect, it } from "vitest";
import {
  demoMatch,
  demoTemplates,
  scoreBars,
  scoreRewrite,
} from "@/lib/landing-report";

describe("landing demo data", () => {
  it("uses the report score dimensions and source rewrite", () => {
    expect(scoreBars).toHaveLength(4);
    expect(scoreRewrite.before).toBe(
      "Led a team of developers on the checkout rebuild.",
    );
    expect(scoreRewrite.after).toBe(
      "Led the checkout rebuild with a team of developers.",
    );
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
