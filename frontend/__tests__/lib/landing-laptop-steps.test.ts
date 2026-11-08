import { expect, it } from "vitest";
import { laptopStepFromProgress } from "@/lib/landing-laptop-steps";

it("keeps the intro until the first step and clamps the final step", () => {
  expect(laptopStepFromProgress(-1)).toBe(0);
  expect(laptopStepFromProgress(0.044)).toBe(0);
  expect(laptopStepFromProgress(0.045)).toBe(0);
  expect(laptopStepFromProgress(0.05)).toBe(1);
  expect(laptopStepFromProgress(0.15)).toBe(2);
  expect(laptopStepFromProgress(0.95)).toBe(10);
  expect(laptopStepFromProgress(2)).toBe(10);
});
