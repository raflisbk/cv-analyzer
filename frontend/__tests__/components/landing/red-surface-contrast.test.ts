import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/contrast";

const globals = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

function tokenIn(block: RegExp, name: string): string {
  const scope = globals.match(block)?.[0] ?? "";
  const value = scope.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`))?.[1];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

const lightRoot = /:root \{[^}]*--red-surface-text[^}]*\}/;
const darkRoot = /\[data-theme="dark"\] \{[^}]*--red-surface-text[^}]*\}/;

describe("red surface that carries small text", () => {
  it("keeps snow text above AA with a margin in light theme", () => {
    const surface = tokenIn(lightRoot, "red-surface-text");
    expect(contrastRatio("#fdfdff", surface)).toBeGreaterThanOrEqual(4.6);
  });

  it("stays closer to the brand red than the deep red", () => {
    const surface = tokenIn(lightRoot, "red-surface-text");
    expect(parseInt(surface.slice(1, 3), 16)).toBeGreaterThan(0xb8);
    expect(contrastRatio("#fdfdff", "#f42902")).toBeLessThan(4.5);
  });

  it("matches the section red in dark theme so dark does not change", () => {
    expect(tokenIn(darkRoot, "red-surface-text")).toBe(
      tokenIn(darkRoot, "red-section"),
    );
  });
});
