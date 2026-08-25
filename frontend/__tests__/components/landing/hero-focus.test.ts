import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

const read = (path: string) =>
  readFileSync(resolve(__dirname, "../../../components/landing", path), "utf8");

describe("landing hero focus", () => {
  test("keeps the hero focused on the boarding-pass system", () => {
    const source = read("hero-section.tsx");

    expect(source).not.toContain("Scissors");
    expect(source).not.toContain("Send");
    expect(source).not.toContain("hero-stamp");
    expect(source).not.toContain("hero-spin");
    expect(source).toContain("hero-barcode");
    expect(source).toContain("hero-stub");
  });

  test("keeps CV preview text readable", () => {
    const source = read("hero-cv-artifact.tsx");

    expect(source).not.toMatch(/text-\[(?:8|9|10)px\]/);
    expect(source).toContain("text-[11px]");
  });
});
