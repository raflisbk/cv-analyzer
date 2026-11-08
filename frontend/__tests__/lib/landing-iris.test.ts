import { describe, expect, it } from "vitest";
import { irisProgress, irisRadius, irisRingStyle } from "@/lib/landing-iris";

describe("landing iris", () => {
  it("maps wrapper travel across one viewport and clamps either end", () => {
    expect(irisProgress(900, 900)).toBe(0);
    expect(irisProgress(630, 900)).toBeCloseTo(0.3);
    expect(irisProgress(0, 900)).toBe(1);
    expect(irisProgress(-200, 900)).toBe(1);
    expect(irisProgress(1200, 900)).toBe(0);
  });

  it("eases the radius until it covers the viewport", () => {
    const full = Math.hypot(1440, 900) * 0.53;
    expect(irisRadius(0, 1440, 900)).toBe(0);
    expect(irisRadius(0.5, 1440, 900)).toBeCloseTo(full / 2);
    expect(irisRadius(1, 1440, 900)).toBeCloseTo(full);
    expect(irisRadius(2, 1440, 900)).toBeCloseTo(full);
  });

  it("centres the transparent ring and hides it outside the transition", () => {
    expect(irisRingStyle(50, 0.5)).toEqual({
      width: "100px",
      height: "100px",
      marginLeft: "-50px",
      marginTop: "-50px",
      opacity: "1",
    });
    expect(irisRingStyle(0, 0.02).opacity).toBe("0");
    expect(irisRingStyle(100, 0.98).opacity).toBe("0");
  });
});
