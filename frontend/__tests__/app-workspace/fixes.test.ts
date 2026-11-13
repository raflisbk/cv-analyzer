import { expect, it } from "vitest";
import { fillNumber, needsNumber } from "@/lib/app-workspace/fixes";
import { fillInputs, flattenFixes } from "@/lib/app-workspace/fixes";

it("requires a valid user number before replacing a placeholder", () => {
  expect(needsNumber("Led [how many?] developers.")).toBe(true);
  expect(fillNumber("Led [how many?] developers.", "")).toBeNull();
  expect(fillNumber("Led [how many?] developers.", "six")).toBeNull();
  expect(fillNumber("Led [how many?] developers.", "6")).toBe(
    "Led 6 developers.",
  );
});

it("uses backend fix ids and carries input questions", () => {
  const fixes = flattenFixes([
    {
      section: "Experience",
      suggestions: [
        {
          priority: "high_impact",
          type: "impact_metric",
          text: "Add scale",
          originalText: "Led a team",
          afterText: "Led [team size] people",
          needsInput: [{ token: "[team size]", question: "How many people?" }],
        },
      ],
    },
  ]);
  expect(fixes[0]).toMatchObject({
    id: "Experience_0_0",
    needsInput: [{ question: "How many people?" }],
  });
});

it("substitutes every supplied backend token", () => {
  const inputs = [
    { token: "[team size]", question: "How many people?" },
    { token: "[timeframe]", question: "Over what period?" },
  ];
  expect(
    fillInputs("Led [team size] people in [timeframe]", inputs, {
      "[team size]": "6",
      "[timeframe]": "2 years",
    }),
  ).toBe("Led 6 people in 2 years");
  expect(
    fillInputs("Led [team size] people", inputs, { "[team size]": "6" }),
  ).toBeNull();
});
