import { describe, expect, it } from "vitest";
import {
  KEY_HOLD,
  LID_CLOSED_DEGREES,
  LID_OPEN_DEGREES,
  TYPED_TEXT,
  clickState,
  keyPressTime,
  lidAngleDegrees,
  sceneProgress,
  typedName,
  typingState,
  zoomAmount,
} from "@/lib/landing-laptop-timeline";

describe("lid angle", () => {
  it("starts closed and cracks to 76 degrees", () => {
    expect(lidAngleDegrees(0)).toBe(LID_CLOSED_DEGREES);
    expect(lidAngleDegrees(0.08)).toBe(LID_CLOSED_DEGREES);
    expect(lidAngleDegrees(0.16)).toBeCloseTo(76, 6);
  });

  it("settles on the open angle and overshoots on the way", () => {
    expect(lidAngleDegrees(0.5)).toBeCloseTo(LID_OPEN_DEGREES, 6);
    expect(lidAngleDegrees(1)).toBeCloseTo(LID_OPEN_DEGREES, 6);
    const overshoot = Math.min(
      ...[0.3, 0.35, 0.4, 0.45].map((value) => lidAngleDegrees(value)),
    );
    expect(overshoot).toBeLessThan(LID_OPEN_DEGREES);
  });
});

describe("scene progress", () => {
  it("is linear before the zoom and eased through it", () => {
    expect(sceneProgress(0)).toBe(0);
    expect(sceneProgress(0.16)).toBeCloseTo(0.38, 6);
    expect(sceneProgress(0.32)).toBeCloseTo(0.76, 6);
    expect(sceneProgress(0.42)).toBeCloseTo(0.88, 6);
    expect(sceneProgress(0.52)).toBe(1);
    expect(sceneProgress(0.9)).toBe(1);
  });

  it("is the same value whichever direction it is read from", () => {
    const forward = [0.1, 0.3, 0.45].map(sceneProgress);
    const backward = [0.45, 0.3, 0.1].map(sceneProgress).reverse();
    expect(forward).toEqual(backward);
  });

  it("zooms only after the typing and click beats", () => {
    expect(zoomAmount(0.76)).toBe(0);
    expect(zoomAmount(0.88)).toBeCloseTo(0.5, 6);
    expect(zoomAmount(1)).toBe(1);
  });
});

describe("typing schedule", () => {
  it("presses one key at a time in order", () => {
    TYPED_TEXT.split("").forEach((_, index) => {
      const at = keyPressTime(index);
      expect(typingState(at + KEY_HOLD / 2).held).toBe(index);
    });
  });

  it("holds no key before typing and after the last press", () => {
    expect(typingState(0.5)).toEqual({ typed: 0, held: -1 });
    expect(typingState(0.8)).toEqual({ typed: TYPED_TEXT.length, held: -1 });
  });

  it("builds the name with title case words", () => {
    expect(typedName(0)).toBe("");
    expect(typedName(6)).toBe("Samuel");
    expect(typedName(TYPED_TEXT.length)).toBe("Samuel Samdono");
  });
});

describe("click beat", () => {
  it("presses between the two click bounds only", () => {
    expect(clickState(0.8).pressed).toBe(false);
    expect(clickState(0.845).pressed).toBe(true);
    expect(clickState(0.9).pressed).toBe(false);
    expect(clickState(0.8475).ripple).toBeCloseTo(0.5, 2);
  });
});
