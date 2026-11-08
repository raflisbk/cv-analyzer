import { expect, test } from "vitest";
import { nextFaqOpen } from "@/lib/landing-faq";
test("FAQ opens a clicked question and closes it on a second click", () => {
  expect(nextFaqOpen(0, 2)).toBe(2);
  expect(nextFaqOpen(2, 2)).toBeNull();
});
