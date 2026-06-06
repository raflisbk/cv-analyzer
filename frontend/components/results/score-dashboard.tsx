

import type { ScoreResult } from "@/lib/types";
import { SUPPORTED_ROLES } from "@/lib/types";
import { GaugeChart } from "./gauge-chart";
import { ScoreRangeBadge } from "./score-range-badge";

interface ScoreDashboardProps {
  scores: ScoreResult;
}

const DIMENSIONS: Array<{
  key: "clarity" | "impact" | "completeness" | "relevance";
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
  const benchmark = scores.benchmark;
  const showBenchmark = benchmark && benchmark.sample_size >= 5;
  const roleLabel = scores.target_role
    ? SUPPORTED_ROLES.find((r) => r.id === scores.target_role)?.label
    : null;

  return (
    <div className="space-y-6">
      <div className="bg-[#F5F2D8]/[0.03] backdrop-blur-sm rounded-2xl p-8 flex flex-col items-center gap-3 border border-white/[0.07]">
        <span className="text-xs font-bold text-[#F5F2D8]/40 uppercase tracking-widest">Overall Score</span>
        <GaugeChart value={scores.overall} label="Overall" size={180} />
        <ScoreRangeBadge score={scores.overall} />

        {roleLabel && (
          <span className="text-xs font-bold rounded-full px-3 py-1 bg-[#8B5CF6]/12 text-[#8B5CF6] border border-[#8B5CF6]/20">
            Scored for: {roleLabel}
          </span>
        )}

        {showBenchmark && (
          <div className="mt-1 rounded-2xl bg-[#CAFF43]/6 border border-[#CAFF43]/15 px-5 py-3 text-center">
            <p className="text-sm font-extrabold text-[#CAFF43]">
              Better than {benchmark.percentile}% of CVs analyzed
            </p>
            <p className="text-xs text-[#F5F2D8]/40 mt-0.5">
              Based on {benchmark.sample_size.toLocaleString()} CVs in our platform
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {DIMENSIONS.map(({ key, label, description, accentColor }) => {
          const scoreVal = scores[key] ?? 0;
          const reasoning = scores.reasonings?.[key];
          
          return (
            <div
              key={key}
              className="rounded-2xl p-5 flex flex-col items-center gap-2 border border-white/[0.07] backdrop-blur-sm"
              style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 8%, transparent)` }}
            >
              <span
                className="text-xs font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full mb-1"
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
              <p className="text-xs text-[#F5F2D8]/60 text-center font-medium mt-1">{description}</p>
              
              {reasoning && (
                <div className="mt-3 p-3 rounded-xl bg-black/20 border border-white/[0.07] w-full">
                  <p className="text-[11px] leading-relaxed text-[#F5F2D8]/80 italic">
                    &ldquo;{reasoning}&rdquo;
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl bg-[#CAFF43]/5 border border-[#CAFF43]/10 p-5 space-y-3">
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#CAFF43]">Overall Calculation Breakdown</h4>
        <p className="text-xs text-[#F5F2D8]/60 leading-relaxed">
          The overall score is a weighted average based on industry standards for CV efficacy:
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#F5F2D8]/40">Clarity</span>
            <span className="font-mono text-[#CAFF43]">40%</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#F5F2D8]/40">Impact</span>
            <span className="font-mono text-[#FF8C42]">25%</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#F5F2D8]/40">Completeness</span>
            <span className="font-mono text-[#8B5CF6]">20%</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#F5F2D8]/40">Relevance</span>
            <span className="font-mono text-[#FF4FCB]">15%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
