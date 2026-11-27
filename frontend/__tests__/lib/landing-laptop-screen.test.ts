import { describe, expect, it } from "vitest";
import {
  clampObjectPosition,
  containScreen,
  laptopBody,
  screenSize,
} from "@/lib/landing-laptop-screen";

describe("laptop screen geometry", () => {
  it("sizes the screen to fit the lid with an even bezel", () => {
    expect(screenSize.width).toBe(1000);
    expect(laptopBody.width - screenSize.width).toBe(laptopBody.bezel * 2);
    expect(laptopBody.lidHeight - screenSize.height).toBe(laptopBody.bezel * 2);
  });

  it("keeps the entire object inside the screen", () => {
    expect(clampObjectPosition(1200, 1000, 96)).toBe(896);
    expect(clampObjectPosition(-100, 1000, 96)).toBe(8);
  });

  it.each([
    [1440, 900],
    [1280, 720],
  ])(
    "contains the whole screen in %ix%i with four percent margins",
    (width, height) => {
      const result = containScreen(
        width,
        height,
        screenSize.width / screenSize.height,
      );
      expect(result.width).toBeLessThanOrEqual(width * 0.92);
      expect(result.height).toBeLessThanOrEqual(height * 0.92);
      expect(result.width / result.height).toBeCloseTo(
        screenSize.width / screenSize.height,
      );
    },
  );
});
