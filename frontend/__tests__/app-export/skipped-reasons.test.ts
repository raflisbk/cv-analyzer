import { expect, it } from "vitest";
import {
  parseSkippedReasons,
  skippedReasonLines,
} from "@/lib/app-export/skipped-reasons";

it("keeps older exports without a reasons header", () => {
  expect(skippedReasonLines(parseSkippedReasons(null), {})).toEqual([]);
});

it("explains one skipped fix by title", () => {
  const reasons = parseSkippedReasons('{"fix-1":"no_room"}');
  expect(
    skippedReasonLines(reasons, { "fix-1": "Summary: be specific" }),
  ).toEqual([
    {
      id: "fix-1",
      title: "Summary: be specific",
      message: expect.stringContaining("No room"),
    },
  ]);
});

it("lists several skipped fixes and handles unknown codes", () => {
  const reasons = parseSkippedReasons(
    '{"a":"needs_input","b":"text_not_found","c":"missing_text","d":"future_code"}',
  );
  const lines = skippedReasonLines(reasons, {
    a: "Metric",
    b: "Verb",
    c: "Summary",
    d: "Skills",
  });
  expect(lines.map((line) => line.title)).toEqual([
    "Metric",
    "Verb",
    "Summary",
    "Skills",
  ]);
  expect(lines.map((line) => line.message)).toEqual([
    expect.stringContaining("needs your answer"),
    expect.stringContaining("not found"),
    expect.stringContaining("no replacement text"),
    expect.stringContaining("could not be applied"),
  ]);
});
