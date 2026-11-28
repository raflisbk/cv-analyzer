import { describe, expect, it } from "vitest";
import {
  cameraPose,
  distanceForSpan,
  restDistance,
  screenCenter,
  viewShift,
  zoomDistance,
  type Fit,
} from "@/lib/landing-laptop-camera";
import { DISPLAY_WIDTH, FIELD_OF_VIEW } from "@/lib/landing-laptop-model";

const fit: Fit = {
  canvas: { width: 1440, height: 900 },
  rest: { x: 720, y: 160, width: 640, height: 400 },
  screenWidth: 1100,
};

describe("camera distance", () => {
  it("fits the display width to the requested pixel width", () => {
    const distance = zoomDistance(fit.canvas, 1100);
    const visibleHeight =
      2 * distance * Math.tan((FIELD_OF_VIEW * Math.PI) / 360);
    const pixelsPerUnit = fit.canvas.height / visibleHeight;
    expect(pixelsPerUnit * DISPLAY_WIDTH).toBeCloseTo(1100, 4);
  });

  it("moves farther away when the target area is smaller", () => {
    expect(distanceForSpan(900, 30, 400)).toBeGreaterThan(
      distanceForSpan(900, 30, 800),
    );
  });

  it("pulls back for a narrower laptop slot", () => {
    const narrow = restDistance(fit.canvas, { ...fit.rest, width: 300 });
    expect(narrow).toBeGreaterThan(restDistance(fit.canvas, fit.rest));
  });
});

describe("camera pose", () => {
  it("looks straight at the screen centre at the end of the zoom", () => {
    const pose = cameraPose(1, fit);
    const center = screenCenter(-14);
    expect(pose.target[1]).toBeCloseTo(center[1], 6);
    expect(pose.target[2]).toBeCloseTo(center[2], 6);
    const offset = pose.position.map(
      (value, index) => value - pose.target[index],
    );
    const length = Math.hypot(...offset);
    expect(length).toBeCloseTo(zoomDistance(fit.canvas, fit.screenWidth), 4);
    expect(offset[1] / length).toBeCloseTo(Math.sin((14 * Math.PI) / 180), 4);
  });

  it("has no view shift once the screen fills the panel", () => {
    const { x, y } = cameraPose(1, fit).shift;
    expect(Math.abs(x) + Math.abs(y)).toBe(0);
  });

  it("centres the laptop in its column at rest", () => {
    const shift = viewShift(fit, 0);
    expect(shift.x).toBe(720 + 320 - 720);
    expect(shift.y).toBe(160 + 200 - 450);
  });

  it("is deterministic for the same progress", () => {
    expect(cameraPose(0.43, fit)).toEqual(cameraPose(0.43, fit));
  });
});
