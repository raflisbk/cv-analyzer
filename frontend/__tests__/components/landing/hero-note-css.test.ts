import { readFileSync } from "node:fs";
import postcss, { type AtRule, type Rule } from "postcss";
import { describe, expect, it } from "vitest";

const css = postcss.parse(
  readFileSync("components/landing/hero/hero-objects.module.css", "utf8"),
);

function declaration(selector: string, prop: string, maxWidth?: number) {
  let value: string | undefined;
  css.walkRules(selector, (rule: Rule) => {
    const media =
      rule.parent?.type === "atrule" ? (rule.parent as AtRule) : null;
    const queryWidth = media?.params.match(/max-width:\s*(\d+)px/)?.[1];
    const applies = maxWidth ? queryWidth === String(maxWidth) : media === null;
    if (applies) {
      rule.walkDecls(prop, (decl) => {
        value = decl.value;
      });
    }
  });
  return value;
}

function sheetShare(maxWidth?: number) {
  const width = declaration(".sheet", "width", maxWidth) ?? "";
  return Number(width.match(/(\d+(?:\.\d+)?)%/)?.[1]);
}

function noteShare(maxWidth?: number) {
  return Number(declaration(".note", "width", maxWidth)?.replace("%", ""));
}

describe("hero handwritten note", () => {
  it.each([undefined, 520])(
    "sits in the gutter left of the CV sheet (breakpoint %s)",
    (maxWidth) => {
      const note = noteShare(maxWidth) || noteShare();
      const sheet = sheetShare(maxWidth) || sheetShare();
      expect(declaration(".note", "left")).toBe("0");
      expect(declaration(".sheet", "right")).toBe("0");
      expect(note + sheet).toBeLessThanOrEqual(100);
    },
  );

  it("points the pen arrow across the full note width", () => {
    expect(declaration('.note :global([data-pen-mark="arrow"])', "width")).toBe(
      "100%",
    );
  });
});

it("lets the note leave with the callouts when the hero scrolls away", () => {
  const source = readFileSync(
    "components/landing/hero/hero-objects.tsx",
    "utf8",
  );
  expect(source).toMatch(/className=\{styles\.note\} data-hero-sticker/);
});
