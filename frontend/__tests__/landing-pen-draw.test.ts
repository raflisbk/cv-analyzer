import { describe, expect, it } from "vitest";
import {
  penShouldDraw,
  penTriggerReady,
} from "@/components/landing/motion/pen-draw";

describe("pen draw trigger", () => {
  it("renders the final mark with reduced motion", () => {
    expect(penShouldDraw(true, true)).toBe(false);
    expect(penShouldDraw(true, false)).toBe(true);
    expect(penShouldDraw(false, false)).toBe(false);
  });

  it("waits for intro completion unless the loader is hidden", () => {
    expect(penTriggerReady(false, false)).toBe(false);
    expect(penTriggerReady(true, false)).toBe(true);
    expect(penTriggerReady(false, true)).toBe(true);
  });
});
