import { expect, it } from "vitest";
import { hasUnsupportedNumbers } from "@/lib/app-workspace/factual-rewrite";

it("rejects an unsupported numerical claim", () => {
  expect(hasUnsupportedNumbers("Led a team", "Led 6 people")).toBe(true);
  expect(hasUnsupportedNumbers("Led 6 people", "Managed 6 people")).toBe(false);
  expect(hasUnsupportedNumbers("Led a team", "Led 6 people", "6")).toBe(false);
});
