import { describe, expect, it } from "vitest";
import quadsData from "@/public/landing/laptop/screen-quads.json";
import {
  clampObjectPosition,
  screenSize,
  screenViewportHeightRatio,
} from "@/lib/landing-laptop-screen";

describe("laptop screen geometry", () => {
  it("sizes the mount from the final visible quad", () => {
    expect(quadsData.quads).toHaveLength(quadsData.frameCount);
    expect(screenSize.width).toBe(1000);
    expect(screenSize.height).toBeGreaterThan(680);
    expect(screenSize.height).toBeLessThan(740);
  });

  it("keeps an object within half its width of the paper edge", () => {
    expect(clampObjectPosition(600, 0, 470, 96)).toBe(422);
    expect(clampObjectPosition(-100, 0, 470, 96)).toBe(-48);
  });

  it("reserves space as the desktop pin releases", () => {
    expect(screenViewportHeightRatio(0.5)).toBe(0.94);
    expect(screenViewportHeightRatio(1)).toBeCloseTo(0.85);
  });
});
