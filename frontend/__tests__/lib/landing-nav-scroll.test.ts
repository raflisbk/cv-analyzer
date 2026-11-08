import { describe, expect, it } from "vitest";
import {
  easeInOutCubic,
  flightPath,
  pointAt,
  scrollDuration,
} from "@/lib/landing-nav-scroll";

describe("landing nav scroll", () => {
  it("clamps scroll duration", () => {
    expect(scrollDuration(0)).toBe(900);
    expect(scrollDuration(5000)).toBe(1300);
    expect(scrollDuration(20000)).toBe(2600);
  });

  it("eases both endpoints and the midpoint", () => {
    expect(easeInOutCubic(0)).toBe(0);
    expect(easeInOutCubic(0.5)).toBe(0.5);
    expect(easeInOutCubic(1)).toBe(1);
  });

  it("sets flight controls from the viewport", () => {
    expect(
      flightPath(
        { x: 100, y: 50 },
        { x: 1320, y: 180 },
        { width: 1200, height: 1000 },
      ),
    ).toEqual({
      start: { x: 100, y: 50 },
      control1: { x: 405, y: 600 },
      control2: { x: 954, y: 900 },
      end: { x: 1320, y: 180 },
    });
  });

  it("clamps points to flight endpoints", () => {
    const path = flightPath(
      { x: 0, y: 0 },
      { x: 120, y: 30 },
      { width: 100, height: 100 },
    );
    expect(pointAt(path, -1)).toEqual(path.start);
    expect(pointAt(path, 1)).toEqual(path.end);
    expect(pointAt(path, 2)).toEqual(path.end);
  });
});
