import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { withLocale } from "../i18n/with-locale";
import { useAppReportScoreReveal } from "@/hooks/use-app-report-score-reveal";
import { contentHtml } from "@/lib/app-workspace/content";
import { flattenFixes } from "@/lib/app-workspace/fixes";
import type { Locale } from "@/lib/i18n/locales";

const react = vi.fn();
vi.mock("@/components/pathy/pathy-context", () => ({
  usePathy: () => ({ react }),
}));

function Probe({ score }: { score: number }) {
  useAppReportScoreReveal(score);
  return null;
}

function renderReveal(locale: Locale) {
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  render(withLocale(<Probe score={67} />, locale));
}

afterEach(() => {
  cleanup();
  react.mockClear();
  vi.unstubAllGlobals();
});

describe("score reveal bubble", () => {
  it("speaks Indonesian", () => {
    renderReveal("id");
    expect(react).toHaveBeenCalledWith("think", "Skor CV kamu 67 dari 100.");
  });

  it("speaks English", () => {
    renderReveal("en");
    expect(react).toHaveBeenCalledWith(
      "think",
      "Your CV scored 67 out of 100.",
    );
  });
});

describe("fix labels", () => {
  it("keeps stable label keys and resolves them for the editor mark", () => {
    const fixes = flattenFixes([
      {
        section: "Experience",
        suggestions: [
          {
            priority: "quick_win",
            type: "impact_metric",
            text: "Add scale",
            originalText: "Led a team",
            afterText: "Led a team of 5",
          },
        ],
      },
    ]);
    expect(fixes[0].label).toBe("noNumber");
    const html = contentHtml(
      "Name\nLed a team",
      fixes,
      (label) => `[${label}]`,
    );
    expect(html).toContain('data-label="[noNumber]"');
  });
});
