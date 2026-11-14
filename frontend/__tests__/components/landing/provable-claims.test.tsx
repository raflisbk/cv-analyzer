import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import FloatingFooter from "@/components/landing/floating-footer";
import StatsSection from "@/components/landing/sections/stats/stats-section";
import FeaturesSection from "@/components/landing/sections/features/features-section";
import FaqSection from "@/components/landing/sections/faq/faq-section";
import { formatLandingCount, landingFacts } from "@/lib/landing-facts";

describe("provable landing claims", () => {
  test("ticker shows sourced counts and no unsupported skills claim", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en">
        <FloatingFooter />
      </I18nProvider>,
    );
    expect(html).toContain(
      `${formatLandingCount(landingFacts.archetypeCount)} Role Archetypes`,
    );
    expect(html).toContain(
      `${formatLandingCount(landingFacts.domainCount)} Domains`,
    );
    expect(html).not.toContain("195+ Skills");
  });

  test("stats panel uses sourced figures without time or ownership percentages", () => {
    const html = renderToStaticMarkup(<StatsSection />);
    expect(html).toContain(`data-value="${landingFacts.scoreDimensions}"`);
    expect(html).toContain(`data-value="${landingFacts.atsCheckCount}"`);
    expect(html).toContain(`data-value="${landingFacts.exportTemplateCount}"`);
    expect(html).not.toContain("60s");
    expect(html).not.toContain("100%");
  });

  test("feature and FAQ scoring claims use the sourced dimension count", () => {
    const html =
      renderToStaticMarkup(<FeaturesSection />) +
      renderToStaticMarkup(<FaqSection />);
    expect(html).toContain(
      `${formatLandingCount(landingFacts.scoreDimensions)} scored dimensions`,
    );
    expect(html).not.toContain("Four dimensions");
  });
});
