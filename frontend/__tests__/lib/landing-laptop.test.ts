import { describe, expect, it } from "vitest";
import {
  LID_CLOSED_DEGREES,
  LID_OPEN_DEGREES,
  STATIC_PROGRESS,
  laptopProgress,
  lidDegrees,
} from "@/lib/landing-laptop";
import { laptopStepFromProgress } from "@/lib/landing-laptop-steps";

describe("laptop progress", () => {
  it("starts with the lid closed and nothing zoomed", () => {
    expect(laptopProgress(0)).toEqual({ lid: 0, zoom: 0, content: 0 });
    expect(lidDegrees(0)).toBe(LID_CLOSED_DEGREES);
  });

  it("opens the lid fully before the zoom starts", () => {
    expect(laptopProgress(0.3).lid).toBe(1);
    expect(laptopProgress(0.32).zoom).toBe(0);
    expect(lidDegrees(1)).toBe(LID_OPEN_DEGREES);
  });

  it("rotates the lid about one hundred degrees", () => {
    expect(LID_OPEN_DEGREES - LID_CLOSED_DEGREES).toBe(100);
  });

  it("overlaps the zoom with the screen content", () => {
    expect(laptopProgress(0.4).zoom).toBeGreaterThan(0);
    expect(laptopProgress(0.4).content).toBeGreaterThan(0);
    expect(laptopProgress(0.52).zoom).toBe(1);
    expect(laptopProgress(0.9).content).toBe(1);
    expect(laptopProgress(1).content).toBe(1);
  });

  it("clamps progress outside the range", () => {
    expect(laptopProgress(-1)).toEqual(laptopProgress(0));
    expect(laptopProgress(2)).toEqual(laptopProgress(1));
  });

  it("shows the static view open, unzoomed and on the intro step", () => {
    const view = laptopProgress(STATIC_PROGRESS);
    expect(view.lid).toBe(1);
    expect(view.zoom).toBe(0);
    expect(laptopStepFromProgress(view.content)).toBe(0);
  });
});
