import { expect, test } from "vitest";
import { processStepProgress } from "@/lib/landing-process";
test("process progress clamps endpoints and handles one step", () => {
  expect(processStepProgress(0, 6)).toBe(0);
  expect(processStepProgress(5, 6)).toBe(1);
  expect(processStepProgress(9, 6)).toBe(1);
  expect(processStepProgress(0, 1)).toBe(0);
});
