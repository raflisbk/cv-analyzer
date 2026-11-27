import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  fileMeta,
  formatMonthYear,
  relativeDate,
} from "@/lib/i18n/format-date";

const now = Date.parse("2026-11-20T12:00:00Z");
const daysAgo = (days: number) => new Date(now - days * 86400000).toISOString();

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(now);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("relativeDate", () => {
  it("uses Indonesian words", () => {
    expect(relativeDate("id", daysAgo(0), now)).toBe("hari ini");
    expect(relativeDate("id", daysAgo(1), now)).toBe("kemarin");
    expect(relativeDate("id", daysAgo(3), now)).toBe("3 hari lalu");
    expect(relativeDate("id", daysAgo(20), now)).toBe("bulan lalu");
  });
  it("uses English words", () => {
    expect(relativeDate("en", daysAgo(0), now)).toBe("today");
    expect(relativeDate("en", daysAgo(3), now)).toBe("3 days ago");
  });
  it("formats old dates with the locale month names", () => {
    const old = "2026-03-10T00:00:00Z";
    expect(relativeDate("id", old, now)).toBe(formatMonthYear("id", old));
    expect(formatMonthYear("id", old)).toContain("Mar");
    expect(formatMonthYear("en", "2026-08-10T00:00:00Z")).toBe("Aug 2026");
    expect(formatMonthYear("id", "2026-08-10T00:00:00Z")).toBe("Agu 2026");
  });
  it("falls back to a translated no-role label", () => {
    expect(fileMeta("id", null, "diedit", daysAgo(0))).toBe(
      "Belum ada target posisi · diedit hari ini",
    );
    expect(fileMeta("en", "Designer", "edited", daysAgo(1))).toBe(
      "Designer · edited yesterday",
    );
  });
});
