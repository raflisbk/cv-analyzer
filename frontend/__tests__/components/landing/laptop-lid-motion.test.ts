import { describe, expect, it } from "vitest";
import { paintLaptopLid } from "@/components/landing/motion/laptop-lid";

function paint(lid: number) {
  const stage = document.createElement("div");
  paintLaptopLid(stage, lid);
  return stage;
}

describe("laptop lid motion", () => {
  it("starts closed, lying on the base", () => {
    expect(paint(0).style.getPropertyValue("--laptop-lid")).toBe("-90deg");
  });

  it("ends open past vertical", () => {
    expect(paint(1).style.getPropertyValue("--laptop-lid")).toBe("10deg");
  });

  it("runs the light sweep only while the lid finishes opening", () => {
    const alpha = (lid: number) =>
      Number(paint(lid).style.getPropertyValue("--laptop-sweep-alpha"));
    expect(alpha(0.3)).toBe(0);
    expect(alpha(0.78)).toBeGreaterThan(0.5);
    expect(alpha(1)).toBe(0);
  });
});
