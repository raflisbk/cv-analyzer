import { describe, expect, it } from "vitest";
import {
  heroCtaFaded,
  heroCtaShowing,
} from "@/components/landing/navbar/nav-handoff";
import {
  barOffset,
  barProgress,
} from "@/components/landing/navbar/nav-progress";

const solid = { opacity: "", visibility: "" };

describe("hero call to action handoff rule", () => {
  it("counts the button as showing from 60 percent visibility", () => {
    expect(heroCtaShowing(0.6, solid)).toBe(true);
    expect(heroCtaShowing(0.59, solid)).toBe(false);
  });

  it("treats a faded or hidden button as gone even while in view", () => {
    expect(heroCtaFaded({ opacity: "0.3", visibility: "" })).toBe(true);
    expect(heroCtaFaded({ opacity: "1", visibility: "hidden" })).toBe(true);
    expect(heroCtaShowing(1, { opacity: "0.3", visibility: "" })).toBe(false);
  });
});

describe("bar progress", () => {
  it("clamps between 0 and 1 over 140 pixels", () => {
    expect(barProgress(-20, false)).toBe(0);
    expect(barProgress(70, false)).toBe(0.5);
    expect(barProgress(900, false)).toBe(1);
  });

  it("snaps to the end states with reduced motion", () => {
    expect(barProgress(139, true)).toBe(0);
    expect(barProgress(140, true)).toBe(1);
  });

  it("glides under the announcement then pins to the edge", () => {
    expect(barOffset(40, 0)).toBe(40);
    expect(barOffset(40, 25)).toBe(15);
    expect(barOffset(40, 300)).toBe(0);
  });
});
