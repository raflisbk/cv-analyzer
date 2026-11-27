import { afterEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { withLocale } from "../i18n/with-locale";
import type { Locale } from "@/lib/i18n/locales";

const captured: { onError?: (error: Error) => void } = {};

vi.mock("@/lib/sse", () => ({
  SSEConnection: vi.fn().mockImplementation(function (
    this: Record<string, unknown>,
    _url: string,
    _onMessage: unknown,
    onError: (error: Error) => void,
  ) {
    captured.onError = onError;
    this.connect = vi.fn();
    this.close = vi.fn();
  }),
}));

import { useJobStream } from "@/hooks/use-job-stream";

afterEach(() => vi.unstubAllGlobals());

describe.each([
  ["complete", "complete", "Analisis selesai!", "Analysis complete!"],
  ["failed", "failed", "Analisisnya belum berhasil.", "Analysis failed."],
] as const)("fallback poll %s", (_name, status, id, en) => {
  it.each([
    ["id", id],
    ["en", en],
  ] as [Locale, string][])(
    "reports a translated message in %s",
    async (locale, expected) => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({ data: { status } }),
        }),
      );
      const { result } = renderHook(
        () => useJobStream("job-1", { onComplete: vi.fn() }),
        { wrapper: ({ children }) => withLocale(children, locale) },
      );
      await act(async () => {
        captured.onError?.(new Error("sse down"));
      });
      expect(result.current.progress?.message).toBe(expected);
    },
  );
});
