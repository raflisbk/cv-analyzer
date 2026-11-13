import { expect, it } from "vitest";
import {
  canApplyFix,
  hasUnsupportedNumbers,
} from "@/lib/app-workspace/factual-rewrite";

it("rejects an unsupported numerical claim", () => {
  expect(hasUnsupportedNumbers("Led a team", "Led 6 people")).toBe(true);
  expect(hasUnsupportedNumbers("Led 6 people", "Managed 6 people")).toBe(false);
  expect(hasUnsupportedNumbers("Led a team", "Led 6 people", "6")).toBe(false);
});

it("allows only the numbers supplied for backend input tokens", () => {
  const answers = { "[team size]": "6", "[timeframe]": "2 years" };
  expect(
    canApplyFix(
      "Led a team",
      "Led 6 people in 2 years",
      "Led [team size] people in [timeframe]",
      answers,
    ),
  ).toBe(true);
  expect(
    canApplyFix(
      "Led a team",
      "Led 6 people in 2 years and saved 40%",
      "Led [team size] people in [timeframe]",
      answers,
    ),
  ).toBe(false);
  expect(canApplyFix("Led a team", "Led [team size] people", "Led [team size] people")).toBe(false);
});
