import { describe, expect, it } from "vitest";
import { HERO_OBJECTS, HERO_STICKERS } from "@/lib/landing-hero-layout";

describe("hero layout", () => {
  it("uses deterministic sticker rotations within the approved range", () => {
    expect(HERO_STICKERS.map(({ rotation }) => rotation)).toEqual([-8, 5, -4]);
    expect(
      HERO_STICKERS.every(({ rotation }) => rotation >= -8 && rotation <= 6),
    ).toBe(true);
  });

  it("uses only the five supplied hero assets", () => {
    expect(HERO_OBJECTS.map(({ asset }) => asset)).toEqual([
      "cv-hero",
      "trophy",
      "magnifier",
      "chart",
      "shield",
    ]);
  });
});
