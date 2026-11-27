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
      expect(insight.mark).toBeTruthy();
    }
  }
});

it("never repeats the same pen mark on neighbouring steps", () => {
  const marks = laptopInsights.slice(1).map(({ mark }) => mark);
  marks.slice(1).forEach((mark, index) => {
    expect(mark).not.toBe(marks[index]);
  });
});
