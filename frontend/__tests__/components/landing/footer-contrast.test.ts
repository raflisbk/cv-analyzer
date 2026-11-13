import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/contrast";

const root = process.cwd();
const footer = readFileSync(
  join(root, "components/landing/sections/footer/footer.module.css"),
  "utf8",
);
const floating = readFileSync(
  join(root, "components/landing/floating-footer.tsx"),
  "utf8",
);
const globals = readFileSync(join(root, "app/globals.css"), "utf8");

function token(name: string): string {
  const value = globals.match(
    new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`),
  )?.[1];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

function cssOpacity(selector: string): number {
  const block = footer.match(new RegExp(`\\${selector}\\s*\\{([^}]*)\\}`))?.[1];
  if (!block) {
    throw new Error(`Missing ${selector}`);
  }
  return Number(block.match(/opacity:\s*([\d.]+)/)?.[1] ?? 1);
}

describe("landing footer contrast", () => {
  it("calculates the WCAG black and white reference ratio", () => {
    expect(contrastRatio("#ffffff", "#000000")).toBeCloseTo(21, 5);
  });

  it("keeps every small footer text pair at AA contrast", () => {
    const ink = token("brand-ink");
    const snow = token("brand-snow");
    const punk = token("brand-punk");
    const floatingOpacity =
      Number(floating.match(/text-\[13px\][^"\n]*opacity-(\d+)/)?.[1]) / 100;
    expect(floatingOpacity).toBeGreaterThan(0);
    expect(contrastRatio(punk, ink)).toBeGreaterThanOrEqual(4.5);
    expect(
      contrastRatio(snow, ink, cssOpacity(".columns span")),
    ).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(snow, ink, floatingOpacity)).toBeGreaterThanOrEqual(
      4.5,
    );
  });
});
