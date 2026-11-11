import { expect, it } from "vitest";
import { fillNumber, needsNumber } from "@/lib/app-workspace/fixes";

it("requires a valid user number before replacing a placeholder", () => {
  expect(needsNumber("Led [how many?] developers.")).toBe(true);
  expect(fillNumber("Led [how many?] developers.", "")).toBeNull();
  expect(fillNumber("Led [how many?] developers.", "six")).toBeNull();
  expect(fillNumber("Led [how many?] developers.", "6")).toBe(
    "Led 6 developers.",
  );
});
