import type { VersionData, VersionDiff } from "../history.types";

export const historyFixture: VersionData[] = [
  {
    id: "v2",
    label: "v2",
    at: "2026-11-11T07:02:00Z",
    score: 77,
    delta: 6,
    summary: "2 fixes applied, 4 grammar notes fixed.",
    current: true,
  },
  {
    id: "v1",
    label: "v1",
    at: "2026-10-12T02:40:00Z",
    score: 71,
    delta: null,
    summary: "First upload. No numbers in bullets, no summary.",
    current: false,
  },
];

export const historyDiffFixture: VersionDiff = {
  before: "Led a team of developers on the checkout rebuild.",
  after: "Led the checkout rebuild with a team of developers.",
};
