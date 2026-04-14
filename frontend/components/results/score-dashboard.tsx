/**
 * Score dashboard: 4 gauge charts in Mathical dark accent cards + overall hero.
 */

import type { ScoreResult } from "@/lib/types";
import { GaugeChart } from "./gauge-chart";
import { ScoreRangeBadge } from "./score-range-badge";

interface ScoreDashboardProps {
  scores: ScoreResult;
}

const DIMENSIONS: Array<{
  key: keyof Omit<ScoreResult, "overall" | "scoring_method">;
  label: string;
  description: string;
  accentColor: string;
}> = [
  {
    key: "clarity",
    label: "Clarity",
    description: "Readability and structure",
    accentColor: "#CAFF43",
  },
  {
    key: "impact",
    label: "Impact",
    description: "Achievements & action verbs",
    accentColor: "#FF8C42",
  },
  {
    key: "completeness",
    label: "Completeness",
    description: "Sections and coverage",
    accentColor: "#8B5CF6",
  },
  {
    key: "relevance",
    label: "Relevance",
    description: "Keywords & ATS match",
    accentColor: "#FF4FCB",
  },
];

export function ScoreDashboard({ scores }: ScoreDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Overall gauge hero */}
      <div className="bg-[#F5F2D8]/[0.03] backdrop-blur-sm rounded-2xl p-8 flex flex-col items-center gap-3 border border-[#F5F2D8]/[0.08]">
        <span className="text-xs font-bold text-[#F5F2D8]/40 uppercase tracking-widest">Overall Score</span>
        <GaugeChart value={scores.overall} label="Overall" size={180} />
        <ScoreRangeBadge score={scores.overall} />
      </div>

      {/* 2×2 dimension cards */}
      <div className="grid grid-cols-2 gap-4">
        {DIMENSIONS.map(({ key, label, description, accentColor }) => {
          const scoreVal = scores[key] ?? 0;
          return (
            <div
              key={key}
              className="rounded-2xl p-5 flex flex-col items-center gap-2 border border-[#F5F2D8]/[0.08] backdrop-blur-sm"
              style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 8%, transparent)` }}
            >
              {/* Accent label pill */}
              <span
                className="text-xs font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ color: accentColor, backgroundColor: `${accentColor}18` }}
              >
                {label}
              </span>
              <GaugeChart
                value={scoreVal}
                label={label}
                size={140}
                accentColor={accentColor}
              />
              <p className="text-xs text-[#F5F2D8]/40 text-center">{description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
