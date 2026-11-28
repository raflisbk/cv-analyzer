import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { withLocale } from "../i18n/with-locale";
import type { Locale } from "@/lib/i18n/locales";

interface StreamState {
  progress: Record<string, unknown> | null;
  error: Error | null;
}

const stream = vi.hoisted(() => ({
  current: { progress: null, error: null } as StreamState,
}));

vi.mock("@/hooks/use-job-stream", () => ({
  useJobStream: () => stream.current,
}));
vi.mock("@/hooks/use-job-results", () => ({
  useJobResults: () => ({ data: undefined, isError: false }),
}));
vi.mock("@/components/pathy/pathy-context", () => ({
  usePathy: () => ({ react: vi.fn() }),
}));
vi.mock("@/hooks/use-app-shell-score-count", () => ({
  useAppShellScoreCount: () => 0,
}));

import { useAppShellAnalysisProgress } from "@/hooks/use-app-shell-analysis-progress";

const render = (locale: Locale = "en") =>
  renderHook(() => useAppShellAnalysisProgress("job-1"), {
    wrapper: ({ children }) => withLocale(children, locale),
  });

const progress = (stage: string, step: number, extra = {}) => ({
  stage,
  percentage: 50,
  message: stage,
  step,
  ...extra,
});

describe("useAppShellAnalysisProgress", () => {
  beforeEach(() => {
    stream.current = { progress: null, error: null };
  });

  it("starts on the first step without a message", () => {
    const { result } = render();
    expect(result.current.active).toBe(0);
    expect(result.current.message).toBeUndefined();
  });

  it.each([
    ["validating", 0],
    ["detecting_archetype", 1],
    ["scoring", 2],
    ["grammar_check", 3],
    ["generating_suggestions", 4],
  ])("fills the card to step for %s", (stage, step) => {
    stream.current = { progress: progress(stage, step), error: null };
    expect(render().result.current.active).toBe(step);
  });

  it("shows the real indexing count in english", () => {
    stream.current = {
      progress: progress("indexing_cv", 4, { done: 7, total: 15 }),
      error: null,
    };
    expect(render("en").result.current.message).toBe("Indexing your CV (7/15)");
  });

  it("shows the real indexing count in indonesian", () => {
    stream.current = {
      progress: progress("indexing_cv", 4, { done: 7, total: 15 }),
      error: null,
    };
    expect(render("id").result.current.message).toBe(
      "Mengindeks CV kamu (7/15)",
    );
  });

  it("marks the card failed when the stream reports failure", () => {
    stream.current = { progress: progress("failed", 2), error: null };
    expect(render().result.current.failed).toBe(true);
  });
});
