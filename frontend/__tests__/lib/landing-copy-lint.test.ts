import { describe, expect, it } from "vitest";
import en from "@/lib/i18n/dictionaries/en";
import id from "@/lib/i18n/dictionaries/id";

function flatten(source: object, prefix = ""): Record<string, string> {
  return Object.entries(source).reduce<Record<string, string>>(
    (result, [key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      if (typeof value === "string") result[path] = value;
      else Object.assign(result, flatten(value, path));
      return result;
    },
    {},
  );
}

const banned = [
  "score it",
  "no card",
  "no spam",
  "mystery",
  "coffee",
  "ready when",
  "free",
  "gratis",
  "seconds",
  "detik",
  "menit",
  "best",
  "powerful",
  "seamless",
  "revolutionary",
  "unlock",
  "supercharge",
];

describe.each([
  ["en", en.landing],
  ["id", id.landing],
] as const)("%s landing copy", (_locale, landing) => {
  const entries = Object.entries(flatten(landing));
  it("avoids unsupported claims and slogan patterns", () => {
    for (const [key, value] of entries) {
      const lower = value.toLowerCase();
      expect(
        banned.filter((word) => lower.includes(word)),
        key,
      ).toEqual([]);
      expect(value.includes("!") && !key.endsWith("button"), key).toBe(false);
      expect(/\bno\s+\w+[,;]\s+no\s+\w+\b/i.test(value), key).toBe(false);
      expect(/\btanpa\s+\w+[,;]\s+tanpa\s+\w+\b/i.test(value), key).toBe(false);
      const fragments = value
        .split(/[.,;]/)
        .map((part) => part.trim())
        .filter(Boolean);
      expect(
        fragments.length === 3 &&
          fragments.every((part) => part.split(/\s+/).length <= 3),
        key,
      ).toBe(false);
    }
  });
  it("keeps digits in sample data or score descriptions", () => {
    for (const [key, value] of entries) {
      if (!/\d/.test(value)) continue;
      expect(
        key.startsWith("sample.") ||
          key.startsWith("laptop.") ||
          key === "report.scoreOutOf",
        key,
      ).toBe(true);
    }
  });
});
