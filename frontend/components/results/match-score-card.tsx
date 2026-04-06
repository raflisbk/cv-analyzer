/**
 * MatchScoreCard — displays overall match percentage with threshold colors,
 * a text label, and breakdown Progress bars for Skills / Experience / Education.
 * Per UI-SPEC §7.2, §4 (threshold colors), §5 (match score display).
 */

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ComparisonResult } from "@/lib/types";

interface MatchScoreCardProps {
  result: ComparisonResult;
}

/** Threshold color per UI-SPEC §4 match score threshold colors */
function getThresholdColor(pct: number): string {
  if (pct >= 80) { return "text-green-500"; }
  if (pct >= 60) { return "text-primary"; }
  if (pct >= 40) { return "text-amber-500"; }
  return "text-destructive";
}

/** Threshold label per UI-SPEC §5 Match Score Display */
function getThresholdLabel(pct: number): string {
  if (pct >= 85) { return "Excellent match"; }
  if (pct >= 70) { return "Good match"; }
  if (pct >= 50) { return "Fair match"; }
  return "Low match";
}

/**
 * Derive breakdown percentages from ComparisonResult.
 * The LLM returns flat lists (not %-by-category), so we approximate:
 * - Skills:     matched_skills / (matched + missing) * 100
 * - Experience: matched_experience / (matched + missing) * 100
 * - Education:  uses overall match_pct as proxy (not in LLM output schema)
 */
function getBreakdown(result: ComparisonResult) {
  const totalSkills =
    result.matched_skills.length + result.missing_skills.length;
  const skillsPct =
    totalSkills > 0
      ? Math.round((result.matched_skills.length / totalSkills) * 100)
      : 0;

  const totalExp =
    result.matched_experience.length + result.missing_experience.length;
  const experiencePct =
    totalExp > 0
      ? Math.round((result.matched_experience.length / totalExp) * 100)
      : 50;

  // Education not tracked in LLM schema — show overall match_pct as proxy
  const educationPct = result.match_pct;

  return { skillsPct, experiencePct, educationPct };
}

export function MatchScoreCard({ result }: MatchScoreCardProps) {
  const thresholdColor = getThresholdColor(result.match_pct);
  const thresholdLabel = getThresholdLabel(result.match_pct);
  const { skillsPct, experiencePct, educationPct } = getBreakdown(result);

  return (
    <Card>
      <CardContent className="p-6">
        {/* Section title per UI-SPEC §5 */}
        <h2 className="text-xl font-bold mb-4">Match Score</h2>

        {/* Large score numeral per UI-SPEC §7.2 */}
        <div className={`text-3xl font-bold ${thresholdColor} mb-1`}>
          {result.match_pct}%
        </div>
        <div className={`text-sm font-medium ${thresholdColor} mb-6`}>
          {thresholdLabel}
        </div>

        {/* Score breakdown bars per UI-SPEC §7.2 */}
        <p className="text-sm font-medium text-muted-foreground mb-4">
          Score Breakdown
        </p>
        <div className="space-y-4">
          {[
            { label: "Skills", value: skillsPct },
            { label: "Experience", value: experiencePct },
            { label: "Education", value: educationPct },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-4">
              <span className="text-sm font-medium w-24 shrink-0">{label}</span>
              <Progress value={value} className="h-2 flex-1" />
              <span className="text-sm text-muted-foreground w-10 text-right">
                {value}%
              </span>
            </div>
          ))}
        </div>

        {/* Overall recommendation from LLM */}
        {result.overall_recommendation && (
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-sm font-medium text-foreground">
              {result.overall_recommendation}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
