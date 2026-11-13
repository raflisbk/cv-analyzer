import { expect, it } from "vitest";
import { parserConfidence } from "@/lib/app-workspace/parser-confidence";
import { render, screen } from "@testing-library/react";
import { AtsCompat } from "@/components/app-workspace/panel/ats-compat";

it.each([
  [0.8, 80],
  [1, 100],
  [100, 100],
  [0, 0],
  [90, 90],
])("maps parser confidence %s to %s percent", (input, expected) => {
  expect(parserConfidence(input)).toBe(expected);
});

it("shows a hatched empty parser bar with not found text", () => {
  render(
    <AtsCompat
      data={{
        score: 0,
        summary: "",
        compat: [],
        parsed: [{ field: "Name", value: "", confidence: 0 }],
        plainText: { lines: [], note: "" },
        checks: [],
        hiddenText: { found: false, items: [] },
      }}
    />,
  );
  expect(screen.getByText("not found")).toBeInTheDocument();
  expect(document.querySelector('[data-empty="true"]')).toBeInTheDocument();
});
