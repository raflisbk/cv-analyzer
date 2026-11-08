import { describe, expect, it } from "vitest";
import { heroChromeHeight } from "@/lib/landing-hero-layout";

describe("heroChromeHeight", () => {
  it("adds the announcement and header heights", () => {
    expect(heroChromeHeight(58, 78)).toBe("136px");
  });
});
