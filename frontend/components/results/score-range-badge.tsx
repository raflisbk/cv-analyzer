/**
 * Score range badge — green (80-100), amber (60-79), red (0-59) per UI-SPEC §4
 */

import { Badge } from "@/components/ui/badge";

interface ScoreRangeBadgeProps {
  score: number;
}

function getScoreLabel(score: number): string {
  if (score >= 80) { return "Good"; }
  if (score >= 60) { return "Average"; }
  return "Needs Work";
}

function getScoreClasses(score: number): string {
  if (score >= 80) { return "bg-green-50 text-green-700 border-green-200"; }
  if (score >= 60) { return "bg-amber-50 text-amber-700 border-amber-200"; }
  return "bg-red-50 text-red-700 border-red-200";
}

export function ScoreRangeBadge({ score }: ScoreRangeBadgeProps) {
  return (
    <Badge variant="outline" className={getScoreClasses(score)}>
      {getScoreLabel(score)}
    </Badge>
  );
}
