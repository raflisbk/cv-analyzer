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
  bgColor: string;
}> = [
  {
    key: "clarity",
    label: "Clarity",
    description: "Readability and structure",
    accentColor: "#CAFF43",
    bgColor: "bg-[#1A2200]",
  },
  {
    key: "impact",
    label: "Impact",
    description: "Achievements & action verbs",
    accentColor: "#FF8C42",
    bgColor: "bg-[#221200]",
  },
  {
    key: "completeness",
    label: "Completeness",
    description: "Sections and coverage",
    accentColor: "#8B5CF6",
    bgColor: "bg-[#150E2A]",
  },
  {
    key: "relevance",
    label: "Relevance",
    description: "Keywords & ATS match",
    accentColor: "#FF4FCB",
    bgColor: "bg-[#230016]",
  },
];

export function ScoreDashboard({ scores }: ScoreDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Overall gauge hero */}
      <div className="bg-[#141414] rounded-2xl p-8 flex flex-col items-center gap-3">
        <span className="text-xs font-bold text-[#F5F2D8]/40 uppercase tracking-widest">Overall Score</span>
        <GaugeChart value={scores.overall} label="Overall" size={180} />
        <ScoreRangeBadge score={scores.overall} />
      </div>

      {/* 2×2 dimension cards */}
      <div className="grid grid-cols-2 gap-4">
        {DIMENSIONS.map(({ key, label, description, accentColor, bgColor }) => {
          const scoreVal = scores[key] ?? 0;
          return (
            <div
              key={key}
              className={`${bgColor} rounded-2xl p-5 flex flex-col items-center gap-2 border border-white/5`}
            >
              {/* Accent label pill */}
              <span
                className="text-[10px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full"
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
              <p className="text-[11px] text-[#F5F2D8]/40 text-center">{description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
