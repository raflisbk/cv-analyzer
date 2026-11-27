import type { VersionData } from "@/lib/app-api/history.types";

type T = (key: string, vars?: Record<string, string | number>) => string;
type SummarySource = Pick<
  VersionData,
  "summary" | "summaryKind" | "changedDimension" | "changedDelta"
>;

const DIMENSIONS = new Set(["impact", "clarity", "relevance", "completeness"]);

function signed(value: number) {
  return value > 0 ? `+${value}` : `${value}`;
}

export function versionSummaryText(
  t: T,
  version: SummarySource,
  scoreDelta: number | null,
) {
  const { summaryKind: kind, changedDimension: dimension } = version;
  if (kind === "first" || kind === "unchanged") {
    return t(`appReport.copy.versionSummary.${kind}`);
  }
  const change = version.changedDelta;
  if (
    kind !== "changed" ||
    !dimension ||
    !DIMENSIONS.has(dimension) ||
    typeof change !== "number" ||
    scoreDelta === null
  ) {
    return version.summary;
  }
  return t("appReport.copy.versionSummary.changed", {
    score: signed(scoreDelta),
    dimension: t(`appReport.dimensions.${dimension}`).toLowerCase(),
    change: signed(change),
  });
}
