import { describe, expect, it } from "vitest";
import {
  annotationsDoNotIntersect,
  heroAnnotationRects,
  HERO_BREAKPOINTS,
  HERO_OBJECTS,
  HERO_STICKERS,
} from "@/lib/landing-hero-layout";

describe("hero layout", () => {
  it("reveals the CV before its findings in reading order", () => {
    expect(HERO_OBJECTS.map(({ asset }) => asset)).toEqual(["cv-hero"]);
    expect(HERO_STICKERS.map(({ name }) => name)).toEqual([
      "ats",
      "impact",
      "gap",
    ]);
  });
});

describe.each(HERO_BREAKPOINTS)(
  "hero annotations at $viewport pixels",
  ({ viewport, stageWidth, stageHeight }) => {
    it("keeps every note and callout clear of the others", () => {
      expect(
        annotationsDoNotIntersect(
          heroAnnotationRects(viewport, stageWidth, stageHeight),
        ),
      ).toBe(true);
    });
  },
);

it("rejects overlapping annotations", () => {
  const rect = { x: 0, y: 0, width: 50, height: 50 };
  expect(annotationsDoNotIntersect([rect, rect])).toBe(false);
});
