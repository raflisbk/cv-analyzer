import { describe, expect, it } from "vitest";
import { versionSummaryText } from "@/lib/app-report/version-summary";
import { format, getDictionary } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/i18n/locales";

function translator(locale: Locale) {
  const dictionary = getDictionary(locale);
  return (key: string, vars?: Record<string, string | number>) => {
    const value = key
      .split(".")
      .reduce<unknown>(
        (node, part) => (node as Record<string, unknown>)?.[part],
        dictionary,
      );
    return typeof value === "string" ? format(value, vars) : key;
  };
}

const changed = {
  summary: "Score +5; impact +3.",
  summaryKind: "changed" as const,
  changedDimension: "impact" as const,
  changedDelta: 3,
};

describe("versionSummaryText", () => {
  it("translates the first analysis", () => {
    const version = {
      summary: "First analysis.",
      summaryKind: "first" as const,
    };
    expect(versionSummaryText(translator("id"), version, null)).toBe(
      "Analisis pertama.",
    );
    expect(versionSummaryText(translator("en"), version, null)).toBe(
      "First analysis.",
    );
  });

  it("translates the unchanged case", () => {
    const version = {
      summary: "No dimension changed.",
      summaryKind: "unchanged" as const,
    };
    expect(versionSummaryText(translator("id"), version, 2)).toBe(
      "Tidak ada dimensi yang berubah.",
    );
  });

  it("builds the changed sentence with a positive delta in both languages", () => {
    expect(versionSummaryText(translator("id"), changed, 5)).toBe(
      "Skor +5; dampak +3.",
    );
    expect(versionSummaryText(translator("en"), changed, 5)).toBe(
      "Score +5; impact +3.",
    );
  });

  it("keeps the minus sign on negative deltas", () => {
    const version = {
      ...changed,
      changedDimension: "clarity" as const,
      changedDelta: -4,
    };
    expect(versionSummaryText(translator("id"), version, -6)).toBe(
      "Skor -6; kejelasan -4.",
    );
  });

  it("falls back to the backend summary when the fields are missing", () => {
    const version = { summary: "Added 2 numbers. Score +6." };
    expect(versionSummaryText(translator("id"), version, 6)).toBe(
      "Added 2 numbers. Score +6.",
    );
  });

  it("falls back when a changed payload lacks its dimension", () => {
    const version = {
      summary: "Score +5; impact +3.",
      summaryKind: "changed" as const,
    };
    expect(versionSummaryText(translator("id"), version, 5)).toBe(
      "Score +5; impact +3.",
    );
  });

  it("falls back when the score delta is unknown", () => {
    expect(versionSummaryText(translator("id"), changed, null)).toBe(
      "Score +5; impact +3.",
    );
  });
});
