import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import postcss, { type AtRule, type Declaration } from "postcss";
import { describe, expect, it } from "vitest";

const root = join(process.cwd(), "components/landing");
const clippedSceneWidths = new Set([
  "sections/laptop/scene/panel.module.css:.panel:width:512px",
  "sections/laptop/scene/paper.module.css:.paper:width:440px",
]);

function modules(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    return entry.isDirectory()
      ? modules(path)
      : entry.name.endsWith(".module.css")
        ? [path]
        : [];
  });
}

function activeOnPhone(declaration: Declaration): boolean {
  const media = declaration.parent?.parent;
  if (media?.type !== "atrule") {
    return true;
  }
  const query = (media as AtRule).params;
  const min = query.match(/min-width:\s*(\d+)px/)?.[1];
  if (min && Number(min) > 390) {
    return false;
  }
  return true;
}

function risky(declaration: Declaration): boolean {
  if (!activeOnPhone(declaration)) {
    return false;
  }
  if (/^(width|min-width)$/.test(declaration.prop)) {
    if (/\b100vw\b/.test(declaration.value)) {
      return true;
    }
    const pixels = declaration.value.match(/^(\d+)px$/)?.[1];
    return Boolean(pixels && Number(pixels) > 390);
  }
  if (!/^(margin|margin-left|margin-right)$/.test(declaration.prop)) {
    return false;
  }
  return [...declaration.value.matchAll(/-(\d+(?:\.\d+)?)(px|vw)/g)].some(
    ([, value, unit]) => unit === "vw" || Number(value) > 16,
  );
}

describe("landing CSS phone overflow", () => {
  it("has no uncontained horizontal overflow patterns at 390px", () => {
    const panel = readFileSync(
      join(root, "sections/section.module.css"),
      "utf8",
    );
    expect(panel.match(/\.panel\s*\{([^}]*)\}/)?.[1]).toMatch(
      /overflow:\s*hidden/,
    );
    const findings: string[] = [];
    for (const file of modules(root)) {
      const css = postcss.parse(readFileSync(file, "utf8"));
      css.walkDecls((declaration) => {
        if (!risky(declaration)) {
          return;
        }
        const selector =
          declaration.parent?.type === "rule"
            ? declaration.parent.selector
            : "";
        const key = `${relative(root, file)}:${selector}:${declaration.prop}:${declaration.value}`;
        if (!clippedSceneWidths.has(key)) {
          findings.push(key);
        }
      });
    }
    expect(findings).toEqual([]);
  });
});
