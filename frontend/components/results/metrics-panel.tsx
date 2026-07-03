import type { DeterministicMetrics, JdKeywordGap } from "@/lib/types";

interface MetricBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
  suffix?: string;
}

function MetricBar({ label, value, max = 1, color = "#CAFF43", suffix = "" }: MetricBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-[#F5F2D8]/60">{label}</span>
        <span className="font-mono font-bold" style={{ color }}>
          {suffix ? `${Math.round(value * 100)}%` : value.toFixed ? value.toFixed(0) : value}
          {suffix}
        </span>
      </div>
      <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function SignalDot({ pass }: { pass: boolean }) {
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${pass ? "bg-[#CAFF43]" : "bg-[#FF4FCB]"}`}
    />
  );
}

interface MetricsPanelProps {
  metrics: DeterministicMetrics;
  jdKeywordGap?: JdKeywordGap | null;
  grammarClarityPenalty?: number | null;
}

export function MetricsPanel({ metrics, jdKeywordGap, grammarClarityPenalty }: MetricsPanelProps) {
  const { action_verb_ratio, section_coverage, contact_signals, employment_gaps } = metrics;

  return (
    <div className="space-y-4">
      {/* Objective score summary */}
      <div className="rounded-xl border border-white/8 bg-white/3 px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#F5F2D8]/40">
            Objective Score
          </p>
          <p className="text-xs text-[#F5F2D8]/50 mt-0.5">
            Rule-based, deterministic — no AI
          </p>
        </div>
        <span
          className="text-2xl font-extrabold"
          style={{
            color: metrics.objective_score >= 70 ? "#CAFF43" : metrics.objective_score >= 50 ? "#FF8C42" : "#FF4FCB",
          }}
        >
          {metrics.objective_score}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* Impact signals */}
        <div className="rounded-xl border border-white/8 bg-[#FF8C42]/5 px-4 py-3 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#FF8C42]">Impact Signals</p>
          <MetricBar
            label={`Quantified bullets (${metrics.bullet_count} total)`}
            value={metrics.quantification_ratio}
            max={1}
            color={metrics.quantification_ratio >= 0.4 ? "#CAFF43" : metrics.quantification_ratio >= 0.2 ? "#FF8C42" : "#FF4FCB"}
            suffix="%"
          />
          <MetricBar
            label="Strong action verbs"
            value={action_verb_ratio.strong_ratio}
            max={1}
            color={action_verb_ratio.strong_ratio >= 0.5 ? "#CAFF43" : action_verb_ratio.strong_ratio >= 0.25 ? "#FF8C42" : "#FF4FCB"}
            suffix="%"
          />
          {action_verb_ratio.weak > 0 && (
            <p className="text-[10px] text-[#FF4FCB]/80">
              {action_verb_ratio.weak} weak verb(s) detected (helped, assisted, supported…)
            </p>
          )}
        </div>

        {/* Clarity signals */}
        <div className="rounded-xl border border-white/8 bg-[#CAFF43]/5 px-4 py-3 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#CAFF43]">Clarity Signals</p>
          <MetricBar
            label="Passive voice sentences"
            value={metrics.passive_voice_ratio}
            max={1}
            color={metrics.passive_voice_ratio <= 0.1 ? "#CAFF43" : metrics.passive_voice_ratio <= 0.25 ? "#FF8C42" : "#FF4FCB"}
            suffix="%"
          />
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#F5F2D8]/60">Avg bullet length</span>
            <span className="font-mono font-bold text-[#F5F2D8]">
              {metrics.avg_bullet_length_words} words
              {metrics.avg_bullet_length_words > 25
                ? " ⚠ too long"
                : metrics.avg_bullet_length_words < 5 && metrics.bullet_count > 0
                  ? " ⚠ too short"
                  : " ✓"}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-[#F5F2D8]/60">Word count</span>
            <span
              className="font-mono font-bold"
              style={{
                color: metrics.word_count >= 250 && metrics.word_count <= 1000 ? "#CAFF43" : "#FF8C42",
              }}
            >
              {metrics.word_count}
            </span>
          </div>
          {grammarClarityPenalty !== null && grammarClarityPenalty !== undefined && grammarClarityPenalty < 0 && (
            <div className="rounded-lg border border-[#FF4FCB]/25 bg-[#FF4FCB]/8 px-3 py-2">
              <p className="text-[10px] font-bold text-[#FF4FCB]">
                Grammar penalty: {grammarClarityPenalty} pts applied to Clarity
              </p>
              <p className="text-[10px] text-[#F5F2D8]/50 mt-0.5">
                Reduce grammar/spelling errors to recover clarity score
              </p>
            </div>
          )}
        </div>

        {/* Completeness signals */}
        <div className="rounded-xl border border-white/8 bg-[#8B5CF6]/5 px-4 py-3 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#8B5CF6]">Completeness Signals</p>
          <MetricBar
            label={`Section coverage (${section_coverage.found.length}/6)`}
            value={section_coverage.score}
            max={100}
            color={section_coverage.score >= 83 ? "#CAFF43" : section_coverage.score >= 50 ? "#FF8C42" : "#FF4FCB"}
          />
          {section_coverage.missing.length > 0 && (
            <p className="text-[10px] text-[#FF4FCB]/80">
              Missing: {section_coverage.missing.join(", ")}
            </p>
          )}
          <MetricBar
            label="Skills verified in experience"
            value={metrics.skill_presence_in_experience}
            max={1}
            color={metrics.skill_presence_in_experience >= 0.5 ? "#CAFF43" : "#FF8C42"}
            suffix="%"
          />
          <div className="flex flex-wrap gap-2 pt-1">
            {[
              ["email", contact_signals.has_email],
              ["phone", contact_signals.has_phone],
              ["linkedin", contact_signals.has_linkedin],
              ["github", contact_signals.has_github],
              ["portfolio", contact_signals.has_portfolio],
            ].map(([label, present]) => (
              <span
                key={label as string}
                className={`inline-flex items-center gap-1 text-[10px] font-bold rounded-full px-2 py-0.5 border ${
                  present
                    ? "border-[#CAFF43]/25 bg-[#CAFF43]/8 text-[#CAFF43]"
                    : "border-white/10 bg-white/3 text-[#F5F2D8]/30 line-through"
                }`}
              >
                {label as string}
              </span>
            ))}
          </div>
          {employment_gaps.gaps_found > 0 && (
            <div className="rounded-lg border border-[#FF8C42]/25 bg-[#FF8C42]/8 px-3 py-2">
              <p className="text-[10px] font-bold text-[#FF8C42]">
                {employment_gaps.gaps_found} employment gap(s) detected —{" "}
                longest: ~{Math.round(employment_gaps.longest_gap_months / 12 * 10) / 10} years
              </p>
            </div>
          )}
        </div>

        {/* JD keyword gap (only when JD was uploaded) */}
        {jdKeywordGap && jdKeywordGap.keyword_count > 0 && (
          <div className="rounded-xl border border-white/8 bg-[#FF4FCB]/5 px-4 py-3 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#FF4FCB]">JD Keyword Match</p>
              <span
                className="text-sm font-extrabold"
                style={{ color: jdKeywordGap.match_ratio >= 0.6 ? "#CAFF43" : "#FF8C42" }}
              >
                {Math.round(jdKeywordGap.match_ratio * 100)}%
              </span>
            </div>
            <MetricBar
              label={`${jdKeywordGap.matched_keywords.length} of ${jdKeywordGap.keyword_count} keywords found`}
              value={jdKeywordGap.match_ratio}
              max={1}
              color="#FF4FCB"
              suffix="%"
            />
            {jdKeywordGap.missing_keywords.length > 0 && (
              <div>
                <p className="text-[10px] font-bold text-[#F5F2D8]/40 mb-1.5">Missing from CV:</p>
                <div className="flex flex-wrap gap-1.5">
                  {jdKeywordGap.missing_keywords.slice(0, 12).map((kw) => (
                    <span
                      key={kw}
                      className="rounded-full border border-[#FF4FCB]/25 bg-[#FF4FCB]/8 px-2 py-0.5 text-[10px] font-bold text-[#FF4FCB]"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
