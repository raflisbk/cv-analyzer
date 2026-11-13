import { describe, expect, it } from "vitest";
import { HERO_OBJECTS, HERO_STICKERS } from "@/lib/landing-hero-layout";

describe("hero layout", () => {
  it("reveals the CV before its findings in reading order", () => {
    expect(HERO_OBJECTS.map(({ asset }) => asset)).toEqual(["cv-hero"]);
    expect(HERO_STICKERS.map(({ label }) => label)).toEqual([
      "ATS OK",
      "92 Impact",
      "Skill gap found",
    ]);
  });
});
