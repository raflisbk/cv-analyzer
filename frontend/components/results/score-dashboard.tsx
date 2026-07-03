
import type { ScoreResult } from "@/lib/types";
import { SUPPORTED_ROLES } from "@/lib/types";
import { GaugeChart } from "./gauge-chart";
import { MetricsPanel } from "./metrics-panel";
import { ScoreRangeBadge } from "./score-range-badge";

interface ScoreDashboardProps {
  scores: ScoreResult;
}

const DIMENSIONS: Array<{
  key: "clarity" | "impact" | "completeness" | "relevance";
  label: string;
  description: string;
  accentColor: string;
  weight: string;
}> = [
  {
    key: "impact",
    label: "Impact",
    description: "Achievements & measurable results",
    accentColor: "#FF8C42",
    weight: "35%",
  },
  {
    key: "clarity",
    label: "Clarity",
    description: "Readability and structure",
    accentColor: "#CAFF43",
    weight: "30%",
  },
  {
    key: "relevance",
    label: "Relevance",
    description: "Keywords & role fit",
    accentColor: "#FF4FCB",
    weight: "20%",
  },
  {
    key: "completeness",
    label: "Completeness",
    description: "Sections and coverage",
    accentColor: "#8B5CF6",
    weight: "15%",
  },
];

export function ScoreDashboard({ scores }: ScoreDashboardProps) {
  const benchmark = scores.benchmark;
  const showBenchmark = benchmark && benchmark.sample_size >= 20;
  const isFallback = scores.scoring_method === "fallback";
  const roleLabel =
    scores.target_role
      ? SUPPORTED_ROLES.find((r) => r.id === scores.target_role)?.label ?? scores.target_role
      : null;
  const hasMetrics = scores.metrics && scores.metrics.bullet_count !== undefined;

  const deltaEntries = scores.version_delta
    ? Object.entries(scores.version_delta).filter(([k]) => k !== "_algorithm_changed")
    : [];

  return (
    <div className="space-y-6">
      {/* Fallback warning */}
      {isFallback && (
        <div className="rounded-xl border border-[#FF4FCB]/40 bg-[#FF4FCB]/8 px-4 py-3">
          <p className="text-xs font-bold text-[#FF4FCB]">
            ⚠ Scoring unavailable — placeholder values shown
          </p>
          <p className="text-[11px] text-[#F5F2D8]/60 mt-0.5">
            The AI scorer could not process this CV. All scores shown (50/100) are
            defaults and do not reflect the actual quality of the CV. Try re-analyzing.
          </p>
        </div>
      )}

      {/* Low confidence warning */}
      {scores.low_confidence && (
        <div className="rounded-xl border border-[#FF8C42]/30 bg-[#FF8C42]/8 px-4 py-3">
          <p className="text-xs font-bold text-[#FF8C42]">⚠ Score confidence: moderate</p>
          <p className="text-[11px] text-[#F5F2D8]/60 mt-0.5">
            Deterministic signals and LLM score diverge significantly. Scores may be less reliable.
          </p>
        </div>
      )}

      {/* Version delta banner — visible when re-uploading from a previous version */}
      {deltaEntries.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-white/4 px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#F5F2D8]/40 mb-2">
            Changes vs previous version
          </p>
          <div className="flex flex-wrap gap-2">
            {deltaEntries.map(([dim, delta]) => (
              <span
                key={dim}
                className="rounded-full px-2.5 py-1 text-[11px] font-bold border"
                style={{
                  color: delta > 0 ? "#CAFF43" : delta < 0 ? "#FF4FCB" : "#F5F2D8",
                  borderColor:
                    delta > 0 ? "#CAFF43" : delta < 0 ? "#FF4FCB" : "rgba(255,255,255,0.1)",
                  backgroundColor:
                    delta > 0
                      ? "rgba(202,255,67,0.08)"
                      : delta < 0
                        ? "rgba(255,79,203,0.08)"
                        : "transparent",
                }}
              >
                {dim}: {delta > 0 ? "+" : ""}
                {delta}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Overall score panel */}
      <div className="bg-[#F5F2D8]/[0.03] backdrop-blur-sm rounded-2xl p-8 flex flex-col items-center gap-3 border border-white/[0.07]">
        <span className="text-xs font-bold text-[#F5F2D8]/40 uppercase tracking-widest">Overall Score</span>
        <GaugeChart value={scores.overall} label="Overall" size={180} />
        <ScoreRangeBadge score={scores.overall} />

        <div className="flex flex-wrap gap-2 justify-center mt-1">
          {roleLabel && (
            <span className="text-xs font-bold rounded-full px-3 py-1 bg-[#8B5CF6]/12 text-[#8B5CF6] border border-[#8B5CF6]/20">
              Role: {roleLabel}
            </span>
          )}
          {scores.scoring_method && (
            <span className="text-xs font-bold rounded-full px-3 py-1 bg-white/5 text-[#F5F2D8]/40 border border-white/10">
              {scores.scoring_method === "llm" ? "AI scored" : scores.scoring_method}
              {scores.ensemble_runs && scores.ensemble_runs > 1 ? ` (${scores.ensemble_runs}×)` : ""}
            </span>
          )}
          {scores.ats_score !== null && scores.ats_score !== undefined && (
            <span
              className="text-xs font-bold rounded-full px-3 py-1 border"
              style={{
                color: scores.ats_score >= 70 ? "#CAFF43" : scores.ats_score >= 50 ? "#FF8C42" : "#FF4FCB",
                borderColor: scores.ats_score >= 70 ? "rgba(202,255,67,0.3)" : scores.ats_score >= 50 ? "rgba(255,140,66,0.3)" : "rgba(255,79,203,0.3)",
                backgroundColor: scores.ats_score >= 70 ? "rgba(202,255,67,0.08)" : scores.ats_score >= 50 ? "rgba(255,140,66,0.08)" : "rgba(255,79,203,0.08)",
              }}
            >
              ATS: {scores.ats_score}/100
            </span>
          )}
        </div>

        {showBenchmark ? (
          <div className="mt-1 rounded-2xl bg-[#CAFF43]/6 border border-[#CAFF43]/15 px-5 py-3 text-center">
            <p className="text-sm font-extrabold text-[#CAFF43]">
              Better than {benchmark!.percentile}% of CVs analyzed
            </p>
            <p className="text-xs text-[#F5F2D8]/40 mt-0.5">
              Based on {benchmark!.sample_size.toLocaleString()} CVs in our platform
            </p>
          </div>
        ) : (
          <p className="text-[10px] text-[#F5F2D8]/20 text-center mt-1">
            Benchmark unlocks after 20+ CVs are analyzed on this platform
          </p>
        )}
      </div>

      {/* Dimension cards */}
      <div className="grid grid-cols-2 gap-4">
        {DIMENSIONS.map(({ key, label, description, accentColor, weight }) => {
          const scoreVal = scores[key] ?? 0;
          const reasoning = scores.reasonings?.[key];
          const delta = scores.version_delta?.[key];

          return (
            <div
              key={key}
              className="rounded-2xl p-5 flex flex-col items-center gap-2 border border-white/[0.07] backdrop-blur-sm"
              style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 8%, transparent)` }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="text-xs font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ color: accentColor, backgroundColor: `${accentColor}18` }}
                >
                  {label}
                </span>
                {delta !== undefined && (
                  <span
                    className="text-[10px] font-extrabold"
                    style={{ color: delta > 0 ? "#CAFF43" : delta < 0 ? "#FF4FCB" : "#F5F2D8" }}
                  >
                    {delta > 0 ? "+" : ""}{delta}
                  </span>
                )}
              </div>
              <GaugeChart
                value={scoreVal}
                label={label}
                size={140}
                accentColor={accentColor}
              />
              <p className="text-xs text-[#F5F2D8]/60 text-center font-medium mt-1">{description}</p>
              <p className="text-[10px] text-[#F5F2D8]/30 font-mono">weight {weight}</p>

              {reasoning && (
                <div className="mt-2 p-3 rounded-xl bg-black/20 border border-white/[0.07] w-full">
                  <p className="text-[11px] leading-relaxed text-[#F5F2D8]/80 italic">
                    &ldquo;{reasoning}&rdquo;
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Weight breakdown */}
      <div className="rounded-2xl bg-[#CAFF43]/5 border border-[#CAFF43]/10 p-5 space-y-3">
        <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#CAFF43]">Score Calculation</h4>
        <div className="grid grid-cols-2 gap-4">
          {DIMENSIONS.map(({ key, label, accentColor, weight }) => (
            <div key={key} className="flex items-center justify-between text-[11px]">
              <span className="text-[#F5F2D8]/40">{label}</span>
              <span className="font-mono" style={{ color: accentColor }}>{weight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Deterministic metrics panel */}
      {hasMetrics && (
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#F5F2D8]/40 mb-3">
            Objective Quality Signals
          </h4>
          <MetricsPanel
            metrics={scores.metrics!}
            jdKeywordGap={scores.jd_keyword_gap}
            grammarClarityPenalty={scores.grammar_clarity_penalty}
          />
        </div>
      )}
    </div>
  );
}
