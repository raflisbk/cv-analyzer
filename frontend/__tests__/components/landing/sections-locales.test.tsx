import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
import { I18nProvider } from "@/components/i18n/i18n-provider";
import en from "@/lib/i18n/dictionaries/en";
import id from "@/lib/i18n/dictionaries/id";
import HeroSection from "@/components/landing/hero/hero-section";
import ProductsSection from "@/components/landing/sections/products/products-section";
import ReportSection from "@/components/landing/sections/report/report-section";
import LaptopSection from "@/components/landing/sections/laptop/laptop-section";
import ProcessSection from "@/components/landing/sections/process/process-section";
import FeaturesSection from "@/components/landing/sections/features/features-section";
import FaqSection from "@/components/landing/sections/faq/faq-section";
import CtaSection from "@/components/landing/sections/cta/cta-section";
import FooterSection from "@/components/landing/sections/footer/footer-section";

const sections = [
  ["hero", HeroSection, "hero"],
  ["products", ProductsSection, "products"],
  ["report", ReportSection, "report"],
  ["inside", LaptopSection, "inside"],
  ["process", ProcessSection, "process"],
  ["features", FeaturesSection, "features"],
  ["faq", FaqSection, "faq"],
  ["cta", CtaSection, "cta"],
  ["footer", FooterSection, "footer"],
] as const;

describe.each([
  ["en", en],
  ["id", id],
] as const)("landing sections in %s", (locale, dictionary) => {
  it.each(sections)(
    "renders %s with its translated heading",
    (_name, Section, key) => {
      const html = renderToStaticMarkup(
        <I18nProvider initialLocale={locale}>
          <Section />
        </I18nProvider>,
      );
      const copy = dictionary.landing[key];
      expect(html).toContain(
        "heading" in copy
          ? copy.heading
          : "live" in copy
            ? copy.live
            : copy.body,
      );
      expect(html).not.toMatch(/landing\.[a-z]+\./);
    },
  );
});
