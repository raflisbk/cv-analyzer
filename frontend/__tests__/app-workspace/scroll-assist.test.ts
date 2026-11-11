import { describe, expect, it } from "vitest";
import {
  hasMoreContent,
  nextScrollTop,
} from "@/lib/app-workspace/scroll-assist";

describe("scroll assist", () => {
  it("shows only while content continues below", () => {
    expect(
      hasMoreContent({ scrollTop: 0, scrollHeight: 1000, clientHeight: 400 }),
    ).toBe(true);
    expect(
      hasMoreContent({ scrollTop: 600, scrollHeight: 1000, clientHeight: 400 }),
    ).toBe(false);
    expect(
      hasMoreContent({ scrollTop: 0, scrollHeight: 400, clientHeight: 400 }),
    ).toBe(false);
  });
  it("moves three quarters of the frame", () => {
    expect(
      nextScrollTop({ scrollTop: 50, scrollHeight: 1000, clientHeight: 400 }),
    ).toBe(350);
  });
});
