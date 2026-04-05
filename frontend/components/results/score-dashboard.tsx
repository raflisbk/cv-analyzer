/**
 * Score dashboard: 4 gauge charts + overall hero per UI-SPEC §7 C2, D-22
 */

import { Card, CardContent } from "@/components/ui/card";
import type { ScoreResult } from "@/lib/types";
import { GaugeChart } from "./gauge-chart";
import { ScoreRangeBadge } from "./score-range-badge";

interface ScoreDashboardProps {
  scores: ScoreResult;
}

// Score dimension labels and descriptions per UI-SPEC §5 "Score labels"
const DIMENSIONS: Array<{
  key: keyof Omit<ScoreResult, "overall">;
  label: string;
  description: string;
}> = [
  {
    key: "clarity",
    label: "Clarity",
    description: "Readability and structure of your CV",
  },
  {
    key: "impact",
    label: "Impact",
    description: "Quantifiable achievements and action verbs",
  },
  {
    key: "completeness",
    label: "Completeness",
    description: "Required sections and content coverage",
  },
  {
    key: "relevance",
    label: "Relevance",
    description: "Keyword matching and ATS compatibility",
  },
];

export function ScoreDashboard({ scores }: ScoreDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Overall score hero */}
      <div className="flex flex-col items-center py-4 gap-2">
        <GaugeChart value={scores.overall} label="Overall" size={200} />
        <ScoreRangeBadge score={scores.overall} />
        <p className="text-sm text-muted-foreground">Overall Score</p>
      </div>

      {/* 2x2 gauge grid per UI-SPEC §7 C2 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {DIMENSIONS.map(({ key, label, description }) => (
          <Card key={key}>
            <CardContent className="flex flex-col items-center gap-2 p-6">
              <GaugeChart value={scores[key]} label={label} size={160} />
              <p className="text-sm text-muted-foreground text-center">
                {label}
              </p>
              <p className="text-xs text-muted-foreground text-center">
                {description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
