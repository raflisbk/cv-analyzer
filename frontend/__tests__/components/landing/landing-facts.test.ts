import { describe, expect, test } from "vitest";
import { formatLandingCount, landingFacts } from "@/lib/landing-facts";

describe("landing facts", () => {
  test("accessor exposes the committed facts without a skill count", () => {
    expect(Object.keys(landingFacts).sort()).toEqual([
      "archetypeCount",
      "atsCheckCount",
      "domainCount",
      "exportTemplateCount",
      "languages",
      "scoreDimensions",
    ]);
    expect(landingFacts.languages).toEqual(["en", "id"]);
    expect(landingFacts.atsCheckCount).toBeGreaterThan(0);
  });

  test("formatter groups thousands without implying a lower bound", () => {
    expect(formatLandingCount(1088)).toBe("1,088");
    expect(formatLandingCount(5)).toBe("5");
  });

  test("formatter adds plus only for an explicit lower bound", () => {
    expect(formatLandingCount(1088, true)).toBe("1,088+");
  });
});
