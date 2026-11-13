import { describe, expect, it } from "vitest";
import { markChangedLines } from "@/lib/app-export/preview";

describe("markChangedLines", () => {
  it("preserves every unchanged original line", () => {
    expect(
      markChangedLines(
        "Name\nBuilt flows\nEducation",
        "Name\nImproved flows\nEducation",
      ),
    ).toEqual([
      { text: "Name", changed: false },
      { text: "Improved flows", changed: true },
      { text: "Education", changed: false },
    ]);
  });
  it("does not mark unchanged text", () => {
    expect(
      markChangedLines("One\nTwo", "One\nTwo").every((line) => !line.changed),
    ).toBe(true);
  });
});

describe("inserted lines", () => {
  it("keeps following original lines unmarked", () => {
    expect(markChangedLines("A\nB\nC", "A\nNew\nB\nC")).toEqual([
      { text: "A", changed: false },
      { text: "New", changed: true },
      { text: "B", changed: false },
      { text: "C", changed: false },
    ]);
  });
});
