import { describe, expect, it } from "vitest";
import { localeFromRequest } from "@/lib/i18n/locale-from-request";

describe("localeFromRequest", () => {
  it.each([
    ["id", "en-US,en;q=0.9", "id"],
    ["en", "id-ID", "en"],
    [null, "fr;q=1,en-US;q=0.8,id;q=0.6", "en"],
    [null, "en;q=0,id;q=0.7", "id"],
    ["fr", "en-GB;q=0.9", "en"],
    [null, "fr,de", "id"],
    [null, "", "id"],
  ] as const)("selects %s from %s", (cookie, header, expected) => {
    expect(localeFromRequest(cookie, header)).toBe(expected);
  });
});
