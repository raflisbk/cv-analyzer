import facts from "./landing-facts.json";

export type LandingFacts = {
  archetypeCount: number;
  atsCheckCount: number;
  domainCount: number;
  exportTemplateCount: number;
  languages: string[];
  scoreDimensions: number;
};

export const landingFacts: LandingFacts = facts;

export function formatLandingCount(count: number, lowerBound = false): string {
  return `${count.toLocaleString("en-US")}${lowerBound ? "+" : ""}`;
}
