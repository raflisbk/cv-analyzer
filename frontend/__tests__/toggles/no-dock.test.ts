import { existsSync, readFileSync } from "node:fs";
import { expect, it } from "vitest";

it("no longer ships the floating dock", () => {
  expect(existsSync("components/dock")).toBe(false);
});

it("does not mount a dock in the root layout", () => {
  const layout = readFileSync("app/layout.tsx", "utf8");
  expect(layout).not.toMatch(/dock/i);
});
