import { expect, it } from "vitest";
import { reportFixAction } from "@/lib/app-report/fix-action";

it.each([
  [
    { title: "Summary: be specific", text: "", points: 1, type: "rewrite" },
    "Show fix",
    "?view=editor&tab=fixes&fixIndex=2",
  ],
  [
    {
      title: "Lead with a stronger verb",
      text: "",
      points: 1,
      type: "action_verb",
    },
    "Show fix",
    "?view=editor&tab=fixes&fixIndex=2",
  ],
  [
    { title: "Add results", text: "", points: 1, type: "impact_metric" },
    "Show fix",
    "?view=editor&tab=fixes&fixIndex=2",
  ],
  [
    { title: "Missing skills", text: "", points: 1, section: "Skills" },
    "Edit skills",
    "?view=editor&tab=fixes&section=Skills",
  ],
  [
    { title: "Formatting", text: "", points: 1, type: "ats" },
    "See ATS checks",
    "?view=editor&tab=ats",
  ],
] as const)("maps a report fix to its own action", (fix, label, suffix) => {
  expect(reportFixAction(fix, "cv-1", 2)).toEqual({
    label,
    href: `/app/cvs/cv-1${suffix}`,
  });
});
