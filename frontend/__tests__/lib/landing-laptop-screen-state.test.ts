import { describe, expect, it } from "vitest";
import { screenState } from "@/lib/landing-laptop-screen-state";

describe("screen state", () => {
  it("is dark and booting before the light comes on", () => {
    const state = screenState(0.3);
    expect(state.dim).toBe(1);
    expect(state.boot).toBe(1);
    expect(state.name).toBe("");
  });

  it("types the name and blinks a caret while typing", () => {
    const state = screenState(0.68);
    expect(state.name.length).toBeGreaterThan(0);
    expect(state.card).toBeGreaterThan(0.5);
    expect([true, false]).toContain(state.caret);
  });

  it("moves the cursor onto the chip and ripples on the click", () => {
    const early = screenState(0.74);
    const late = screenState(0.84);
    expect(late.cursorX).toBeGreaterThan(early.cursorX);
    expect(late.ripple).toBeGreaterThan(0);
    expect(late.chip).toBe(0.92);
  });

  it("settles on the first frame image with no pointer at the hand-off", () => {
    const state = screenState(1);
    expect(state.poster).toBe(1);
    expect(state.cursor).toBe(0);
    expect(state.glare).toBe(0);
    expect(state.dim).toBe(0);
    expect(state.boot).toBe(0);
  });
});
