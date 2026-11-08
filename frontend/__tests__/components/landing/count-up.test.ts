import { expect, test } from "vitest";
import { countUpValue } from "@/lib/landing-stats";
test("count-up rounds and clamps the displayed value", () => {
  expect(countUpValue(0.496, 100, "%")).toBe("50%");
  expect(countUpValue(2, 60, "s")).toBe("60s");
  expect(countUpValue(-1, 4, "")).toBe("0");
});
