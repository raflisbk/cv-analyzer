import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";

const root = join(process.cwd(), "components/landing");
const allowed = [/\.ticker\b/, /\.liveDot\b/];

function cssModules(folder: string): string[] {
  return readdirSync(folder, { withFileTypes: true }).flatMap((entry) => {
    const path = join(folder, entry.name);
    if (entry.isDirectory()) return cssModules(path);
    return entry.name.endsWith(".module.css") ? [path] : [];
  });
}

it("has no infinite CSS animation outside informative indicators", () => {
  for (const path of cssModules(root)) {
    const css = readFileSync(path, "utf8");
    for (const match of css.matchAll(
      /([^{}]+)\{[^{}]*animation\s*:[^;]*\binfinite\b[^{}]*\}/g,
    )) {
      expect(
        allowed.some((selector) => selector.test(match[1])),
        path,
      ).toBe(true);
    }
  }
});
