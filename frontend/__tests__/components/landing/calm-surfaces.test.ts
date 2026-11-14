import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import postcss from "postcss";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/contrast";

const root = join(process.cwd(), "components/landing");
const tokens = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");

function token(name: string): string {
  const value = tokens.match(
    new RegExp(`--brand-${name}:\\s*(#[0-9a-f]{6})`),
  )?.[1];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function modules(folder: string): string[] {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    return entry.isDirectory()
      ? modules(path)
      : entry.name.endsWith(".module.css")
        ? [path]
        : [];
  });
}

describe("landing calm surfaces", () => {
  it.each([
    ["products", "ink", "snow"],
    ["report", "ink", "snow"],
    ["laptop", "ink", "blush"],
    ["process", "snow", "ink"],
    ["inside", "ink", "snow"],
    ["faq", "ink", "snow"],
    ["score card", "snow", "ink"],
    ["support cards", "ink", "blush"],
  ])("keeps %s text legible", (_section, foreground, background) => {
    expect(
      contrastRatio(token(foreground), token(background)),
    ).toBeGreaterThanOrEqual(4.5);
  });

  it("keeps hero and CTA large snow type legible on red", () => {
    expect(contrastRatio(token("snow"), token("red"))).toBeGreaterThanOrEqual(
      3,
    );
  });

  it("reserves card rotation for the working score card", () => {
    const rotated: string[] = [];
    for (const path of modules(root)) {
      postcss.parse(readFileSync(path, "utf8")).walkRules((rule) => {
        if (
          !/\.(?:card|cardInner|item|sticker|status|callout|tag)\b/.test(
            rule.selector,
          )
        )
          return;
        rule.walkDecls((decl) => {
          if (decl.prop === "rotate" || /rotate\(/.test(decl.value))
            rotated.push(`${path}:${rule.selector}`);
        });
      });
    }
    expect(rotated).toEqual([
      `${join(root, "sections/report/report.module.css")}:`.concat(".card"),
    ]);
  });
});
