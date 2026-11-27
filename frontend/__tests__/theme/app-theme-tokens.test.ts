import { describe, expect, it } from "vitest";
import { customProperties, parseRules, readSource } from "./css-blocks";

const globalRules = parseRules(readSource("app/globals.css"));
const appTokenRules = parseRules(readSource("app/app/app-tokens.css"));

const lightScope = /(^|\s|,)(:root|\.app-root)$/;
const darkScope = /\[data-theme="dark"\](\s+\.app-root)?$/;

const lightTokens = new Map([
  ...customProperties(globalRules, lightScope),
  ...customProperties(appTokenRules, lightScope),
]);
const darkTokens = customProperties(globalRules, darkScope);

const semanticTokens = [
  "--surface",
  "--surface-raised",
  "--surface-tint",
  "--text",
  "--text-muted",
  "--line",
  "--accent-red",
  "--accent-red-deep",
  "--red-section",
  "--red-section-deep",
  "--ink-section",
  "--dock-bg",
  "--dock-ring",
];

const appRoleTokens = [
  "--app-red",
  "--app-red-deep",
  "--app-snow",
  "--app-blush",
  "--app-ink",
  "--app-ink-soft",
  "--app-page",
  "--app-snow-fill",
  "--app-deep-text",
  "--app-overlay",
  "--app-popover",
  "--app-popover-ink",
  "--app-popover-line",
];

describe("theme tokens", () => {
  it.each(semanticTokens)("%s exists in light and dark", (token) => {
    expect(lightTokens.has(token)).toBe(true);
    expect(darkTokens.has(token)).toBe(true);
  });

  it.each(appRoleTokens)("%s exists in light and dark", (token) => {
    expect(lightTokens.has(token)).toBe(true);
    expect(darkTokens.has(token)).toBe(true);
  });

  it("never overrides a token in dark that light does not define", () => {
    const shadcnTokens =
      /^--(background|foreground|card|muted|border|input|secondary)/;
    const orphans = [...darkTokens.keys()].filter(
      (name) => !lightTokens.has(name) && !shadcnTokens.test(name),
    );
    expect(orphans).toEqual([]);
  });

  it("keeps fixed on-colour tokens identical across themes", () => {
    expect(lightTokens.get("--app-on-red")).toBe("#fdfdff");
    expect(lightTokens.get("--app-on-punk")).toBe("#1a0b07");
    expect(darkTokens.has("--app-on-red")).toBe(false);
    expect(darkTokens.has("--app-on-punk")).toBe(false);
  });

  it("flips surface and ink roles in dark", () => {
    expect(darkTokens.get("--app-ink")).not.toBe(lightTokens.get("--app-ink"));
    expect(darkTokens.get("--app-snow")).not.toBe(
      lightTokens.get("--app-snow"),
    );
  });

  it("keeps documents paper-white in both themes", () => {
    expect(lightTokens.get("--app-paper")).toMatch(/^#f[cdf]/i);
    expect(darkTokens.has("--app-paper")).toBe(false);
    expect(darkTokens.has("--app-paper-ink")).toBe(false);
  });
});
