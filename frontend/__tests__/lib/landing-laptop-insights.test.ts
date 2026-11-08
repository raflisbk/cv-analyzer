import { expect, it } from "vitest";
import { laptopInsights } from "@/lib/landing-laptop-insights";

it("contains the intro and ten complete, ordered insights", () => {
  expect(laptopInsights).toHaveLength(11);
  expect(laptopInsights.map(({ key }) => key)).toEqual([
    "intro",
    "contact",
    "summary",
    "payly",
    "edit",
    "brightly",
    "projects",
    "education",
    "skills",
    "certs",
    "lang",
  ]);
  for (const [index, insight] of laptopInsights.entries()) {
    expect(insight.eyebrow).toBeTruthy();
    expect(insight.title).toBeTruthy();
    expect(insight.body).toBeTruthy();
    if (index) {
      expect(insight.chip).toBeTruthy();
      expect(insight.target).toBeTruthy();
      expect(insight.object).toBeTruthy();
    }
  }
});
