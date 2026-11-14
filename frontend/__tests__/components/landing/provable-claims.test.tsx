import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test } from "vitest";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import FloatingFooter from "@/components/landing/floating-footer";
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
      `${formatLandingCount(landingFacts.archetypeCount)} role archetypes`,
    );
    expect(html).toContain(
      `${formatLandingCount(landingFacts.domainCount)} domains`,
    );
    expect(html).not.toContain("195+ Skills");
  });

  test("inside facts row uses sourced figures without time or ownership percentages", () => {
    const html = renderToStaticMarkup(
      <I18nProvider initialLocale="en">
        <FeaturesSection />
      </I18nProvider>,
    );
    expect(html).toContain('aria-label="Checks and exports in CV Analyzer"');
    expect(html).toContain(`data-value="${landingFacts.scoreDimensions}"`);
    expect(html).toContain(`data-value="${landingFacts.atsCheckCount}"`);
    expect(html).toContain(`data-value="${landingFacts.exportTemplateCount}"`);
    expect(html).not.toContain("60s");
    expect(html).not.toContain("100%");
  });

  test("feature and FAQ scoring claims use the sourced dimension count", () => {
    const html =
      renderToStaticMarkup(
        <I18nProvider initialLocale="en">
          <FeaturesSection />
        </I18nProvider>,
      ) +
      renderToStaticMarkup(
        <I18nProvider initialLocale="en">
          <FaqSection />
        </I18nProvider>,
      );
    expect(html).toContain(
      `${formatLandingCount(landingFacts.scoreDimensions)} scoring dimensions`,
    );
    expect(html).not.toContain("Four dimensions");
  });
});
