

import type { ComparisonResult } from "@/lib/types";

interface MatchScoreCardProps {
  result: ComparisonResult;
}

function getThresholdColor(pct: number): string {
  if (pct >= 80) { return "#CAFF43"; }
  if (pct >= 60) { return "#FF8C42"; }
  if (pct >= 40) { return "#FF8C42"; }
  return "#FF4FCB";
}

function getThresholdLabel(pct: number): string {
  if (pct >= 85) { return "Excellent Match"; }
  if (pct >= 70) { return "Good Match"; }
  if (pct >= 50) { return "Fair Match"; }
  return "Low Match";
}

function getBreakdown(result: ComparisonResult) {
  const totalSkills = result.matched_skills.length + result.missing_skills.length;
  const skillsPct = totalSkills > 0
    ? Math.round((result.matched_skills.length / totalSkills) * 100)
    : 0;
  const totalExp = result.matched_experience.length + result.missing_experience.length;
  const experiencePct = totalExp > 0
    ? Math.round((result.matched_experience.length / totalExp) * 100)
    : 50;
  const educationPct = result.match_pct;
  return { skillsPct, experiencePct, educationPct };
}

export function MatchScoreCard({ result }: MatchScoreCardProps) {
  const color = getThresholdColor(result.match_pct);
  const label = getThresholdLabel(result.match_pct);
  const { skillsPct, experiencePct, educationPct } = getBreakdown(result);

  const BREAKDOWN = [
    { label: "Skills", value: skillsPct, color: "#CAFF43" },
    { label: "Experience", value: experiencePct, color: "#FF8C42" },
    { label: "Education", value: educationPct, color: "#8B5CF6" },
  ];

  return (
    <div className="bg-[#1C1C1C] rounded-2xl border border-white/5 p-6 md:p-8">
      <h2 className="font-display font-extrabold text-lg text-[#F5F2D8] mb-6">Match Score</h2>

      <div className="flex items-end gap-3 mb-6">
        <span className="font-display font-extrabold text-5xl leading-none" style={{ color }}>
          {result.match_pct}%
        </span>
        <span
          className="text-sm font-extrabold uppercase tracking-wider rounded-full px-3 py-1 mb-1"
          style={{ color, backgroundColor: `${color}18` }}
        >
          {label}
        </span>
      </div>

      <p className="text-xs font-bold text-[#F5F2D8]/40 uppercase tracking-widest mb-4">Score Breakdown</p>
      <div className="space-y-3">
        {BREAKDOWN.map(({ label: lbl, value, color: barColor }) => (
          <div key={lbl} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-[#F5F2D8]/70">{lbl}</span>
              <span className="text-sm font-extrabold" style={{ color: barColor }}>{value}%</span>
            </div>
            <div className="h-2 bg-white/8 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${value}%`, backgroundColor: barColor }}
              />
            </div>
          </div>
        ))}
      </div>

      {result.overall_recommendation && (
        <div className="mt-6 pt-5 border-t border-white/8">
          <p className="text-sm text-[#F5F2D8]/70 leading-relaxed">{result.overall_recommendation}</p>
        </div>
      )}
    </div>
  );
}
