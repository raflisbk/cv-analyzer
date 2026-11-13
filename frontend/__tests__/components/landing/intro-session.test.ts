import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  hasSeenLandingIntro,
  markLandingIntroSeen,
} from "@/lib/landing-intro-session";

describe("landing intro session", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("treats a new tab session as unseen", () => {
    expect(hasSeenLandingIntro()).toBe(false);
  });

  it("remembers the intro in the current tab session", () => {
    markLandingIntroSeen();
    expect(hasSeenLandingIntro()).toBe(true);
    expect(sessionStorage.getItem("pathkr-intro-seen")).toBe("1");
  });

  it("treats inaccessible storage as unseen", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(hasSeenLandingIntro()).toBe(false);
  });

  it("does not throw when storage cannot be written", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    expect(() => markLandingIntroSeen()).not.toThrow();
    expect(hasSeenLandingIntro()).toBe(false);
  });
});
