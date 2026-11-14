import facts from "./landing-facts.json";
import type { Locale } from "./i18n/locales";

export type LandingFacts = {
  archetypeCount: number;
  atsCheckCount: number;
  domainCount: number;
  exportTemplateCount: number;
  languages: string[];
  scoreDimensions: number;
};

export const landingFacts: LandingFacts = facts;

export function formatLandingCount(
  count: number,
  lowerBound = false,
  locale: Locale = "en",
): string {
  return `${count.toLocaleString(locale === "id" ? "id-ID" : "en-US")}${lowerBound ? "+" : ""}`;
}
