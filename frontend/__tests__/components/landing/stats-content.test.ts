import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const statsSource = readFileSync(
  resolve(__dirname, "../../../components/landing/stats-section.tsx"),
  "utf8",
);

describe("landing stats content", () => {
  test("uses the verified role archetype count", () => {
    expect(statsSource).toContain('number: "1,088", label: "Role Archetypes"');
    expect(statsSource).not.toContain("10,000+");
  });
});
