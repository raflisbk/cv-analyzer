import { describe, expect, it } from "vitest";
import { STATIC_PROGRESS, laptopProgress } from "@/lib/landing-laptop";
import { laptopStepFromProgress } from "@/lib/landing-laptop-steps";

describe("laptop progress", () => {
  it("starts closed with nothing zoomed", () => {
    expect(laptopProgress(0)).toEqual({ scene: 0, zoom: 0, content: 0 });
  });

  it("reaches the zoom start of the scene when the scroll zoom begins", () => {
    expect(laptopProgress(0.32).scene).toBeCloseTo(0.76, 6);
    expect(laptopProgress(0.32).zoom).toBe(0);
  });

  it("overlaps the zoom with the screen content", () => {
    expect(laptopProgress(0.4).zoom).toBeGreaterThan(0);
    expect(laptopProgress(0.4).content).toBeGreaterThan(0);
    expect(laptopProgress(0.52).zoom).toBe(1);
    expect(laptopProgress(0.52).scene).toBe(1);
    expect(laptopProgress(0.9).content).toBe(1);
    expect(laptopProgress(1).content).toBe(1);
  });

  it("clamps progress outside the range", () => {
    expect(laptopProgress(-1)).toEqual(laptopProgress(0));
    expect(laptopProgress(2)).toEqual(laptopProgress(1));
  });

  it("shows the static view open, unzoomed and on the intro step", () => {
    const view = laptopProgress(STATIC_PROGRESS);
    expect(view.scene).toBeLessThan(0.76);
    expect(view.zoom).toBe(0);
    expect(laptopStepFromProgress(view.content)).toBe(0);
  });
});
