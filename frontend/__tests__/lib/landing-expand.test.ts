import { describe, expect, it } from "vitest";
import {
  easeInOut,
  expandProgress,
  panelWidth,
  panelRadius,
  panelPaddingExtra,
} from "@/lib/landing-expand";

describe("landing expand calculations", () => {
  it("eases and clamps progress", () => {
    expect(easeInOut(-1)).toBe(0);
    expect(easeInOut(0.5)).toBe(0.5);
    expect(easeInOut(2)).toBe(1);
  });

  it("expands as the panel enters and remains expanded", () => {
    expect(
      expandProgress({ top: 900, bottom: 1800, viewport: 900 }, "expand"),
    ).toBe(0);
    expect(
      expandProgress({ top: 382.5, bottom: 1282.5, viewport: 900 }, "expand"),
    ).toBe(0.5);
    expect(
      expandProgress({ top: -100, bottom: 100, viewport: 900 }, "expand"),
    ).toBe(1);
  });

  it("eases sheet top corners over 90 percent of the viewport", () => {
    expect(
      expandProgress({ top: 810, bottom: 1700, viewport: 900 }, "sheet"),
    ).toBe(0);
    expect(
      expandProgress({ top: 405, bottom: 1295, viewport: 900 }, "sheet"),
    ).toBe(0.5);
    expect(
      expandProgress({ top: -1, bottom: 899, viewport: 900 }, "sheet"),
    ).toBe(1);
  });

  it("interpolates the panel width from wide to viewport", () => {
    expect(panelWidth(0, 1440)).toBe(1408);
    expect(panelWidth(0.5, 1440)).toBe(1424);
    expect(panelWidth(1, 1800)).toBe(1800);
    expect(panelWidth(-1, 1800)).toBe(1600);
  });

  it("reduces the corner radius as the panel expands", () => {
    expect(panelRadius(0)).toBe(48);
    expect(panelRadius(0.5)).toBe(24);
    expect(panelRadius(2)).toBe(0);
  });

  it("adds padding only beyond the 1600 pixel content box", () => {
    expect(panelPaddingExtra(1440)).toBe(0);
    expect(panelPaddingExtra(1800)).toBe(100);
  });
});
