import { describe, expect, it } from "vitest";
import en from "@/lib/i18n/dictionaries/en";
import { demoMatch, demoTemplates, scoreBars } from "@/lib/landing-report";

describe("landing demo data", () => {
  it("uses the report score dimensions and source rewrite", () => {
    expect(scoreBars).toHaveLength(4);
    expect(en.landing.report.before).toBe(
      "Led a team of developers on the checkout rebuild.",
    );
    expect(en.landing.report.after).toBe(
      "Led the checkout rebuild with a team of developers.",
    );
  });

  it("shows evidence for each job requirement and PDF options", () => {
    expect(demoMatch.requirements.map(({ met }) => met)).toEqual([
      true,
      true,
      false,
    ]);
    expect(
      demoMatch.requirements.every(({ evidence }) => evidence.length > 0),
    ).toBe(true);
    expect(demoTemplates).toHaveLength(3);
  });
});
