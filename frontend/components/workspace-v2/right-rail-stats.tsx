"use client";
/**
 * RightRailStats — right summary rail for workspace-v2.
 * ONE-WAY SYNC: left panel → right rail (not the reverse).
 * - Left panel sets activeDetailTab → right rail accordion auto-expands.
 * - Right rail accordion toggle → local open state only, does NOT open left panel.
 * - "View details →" button explicitly opens left panel via setActiveDetailTab.
 */
import { useEffect, useState, useRef } from "react";
import { ChevronDown, Send, Bot, BarChart2, Lightbulb, LayoutDashboard, CheckCircle2, Layers, ExternalLink } from "lucide-react";
import { useWorkspaceV2Store } from "@/lib/stores/workspace-v2-store";
import { cn } from "@/lib/utils";

interface RightRailStatsProps {
  className?: string;
}

type TabId = "overview" | "scores" | "suggestions" | "grammar" | "skills";

/** Animated score bar — grows from 0 on mount */
function ScoreBar({
  score,
  color,
  delay = 0,
}: {
  score: number | null;
  color: string;
  delay?: number;
}) {
  const [width, setWidth] = useState(0);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const t = setTimeout(() => {
      setWidth(score ?? 0);
    }, delay + 80);
    return () => clearTimeout(t);
  }, [score, delay]);

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgba(245,242,216,0.07)]">
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${width}%`, background: color }}
      />
    </div>
  );
}

// ── Accordion section — one-way sync from store ────────────────────────────
interface AccordionSectionProps {
  tabId: TabId;
  title: string;
  subtitle: string;
  accentColor: string;
  Icon: React.ElementType;
  children: React.ReactNode;
}

function AccordionSection({
  tabId,
  title,
  subtitle,
  accentColor,
  Icon,
  children,
}: AccordionSectionProps) {
  const { activeDetailTab, setActiveDetailTab } = useWorkspaceV2Store();
  const [localOpen, setLocalOpen] = useState(false);

  // Sync FROM left panel
  useEffect(() => {
    if (activeDetailTab === tabId) {
      setLocalOpen(true);
    }
  }, [activeDetailTab, tabId]);

  const handleToggle = () => {
    setLocalOpen((prev) => !prev);
  };

  return (
    <section
      className="overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-200"
      style={{
        borderColor: localOpen
          ? `color-mix(in srgb, ${accentColor} 25%, transparent)`
          : "rgba(245,242,216,0.06)",
        background: localOpen
          ? "rgba(245,242,216,0.04)"
          : "rgba(245,242,216,0.02)",
      }}
    >
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-[rgba(245,242,216,0.03)]"
      >
        {/* Icon */}
        <div
          className="flex h-7 w-7 flex-none items-center justify-center rounded-xl transition-colors"
          style={{
            background: localOpen
              ? `color-mix(in srgb, ${accentColor} 18%, transparent)`
              : "rgba(245,242,216,0.05)",
          }}
        >
          <Icon
            className="h-3.5 w-3.5"
            style={{ color: localOpen ? accentColor : "rgba(245,242,216,0.4)" }}
            aria-hidden="true"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className="font-display text-[13px] font-bold leading-tight transition-colors"
            style={{ color: localOpen ? "#F5F2D8" : "rgba(245,242,216,0.75)" }}
          >
            {title}
          </p>
          <p className="mt-0.5 text-[10px] text-[#F5F2D8]/60 leading-tight">{subtitle}</p>
        </div>

        <div
          className={cn(
            "flex h-5 w-5 flex-none items-center justify-center rounded-full transition-all duration-200",
            localOpen ? "rotate-180" : ""
          )}
          style={{
            background: localOpen
              ? `color-mix(in srgb, ${accentColor} 15%, transparent)`
              : "rgba(245,242,216,0.06)",
          }}
        >
          <ChevronDown
            className="h-2.5 w-2.5"
            style={{ color: localOpen ? accentColor : "rgba(245,242,216,0.35)" }}
            aria-hidden="true"
          />
        </div>
      </button>

      {localOpen && (
        <div
          className="border-t px-3.5 pb-4 pt-3"
          style={{ borderColor: `color-mix(in srgb, ${accentColor} 12%, transparent)` }}
        >
          {children}
          <button
            type="button"
            onClick={() => setActiveDetailTab(tabId)}
            className="mt-3.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider transition-opacity hover:opacity-70"
            style={{ color: accentColor, opacity: 0.75 }}
          >
            View details
            <ExternalLink className="h-2.5 w-2.5" aria-hidden="true" />
          </button>
        </div>
      )}
    </section>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export function RightRailStats({ className }: RightRailStatsProps) {
  const { hydration } = useWorkspaceV2Store();
  const [chatInput, setChatInput] = useState("");

  const analysis = hydration?.analysis;
  const overallScore = analysis?.scores?.overall ?? null;
  const clarityScore = analysis?.scores?.clarity ?? null;
  const impactScore = analysis?.scores?.impact ?? null;
  const atsChecks = analysis?.ats_checks ?? [];
  const suggestionCount = analysis?.suggestions
    ? analysis.suggestions.flatMap((c) => c.suggestions).length
    : 0;
  
  const grammarIssues = analysis?.grammar_issues ?? [];
  const skillsCount = analysis?.skills?.length ?? 0;

  const atsCompatibility =
    atsChecks.length > 0
      ? Math.round(
          (atsChecks.filter((c) => c.status === "pass").length / atsChecks.length) * 100
        )
      : null;

  const scoreGrade =
    overallScore === null
      ? null
      : overallScore >= 85
      ? { label: "Excellent", color: "#CAFF43" }
      : overallScore >= 70
      ? { label: "Good", color: "#FF8C42" }
      : { label: "Needs Work", color: "#f87171" };

  return (
    <div className={cn("flex h-full flex-col overflow-hidden", className)}>

      {/* ── Panel header: score hero ── */}
      <div
        className="flex-none border-b px-4 py-3.5 rounded-t-2xl"
        style={{
          borderColor: "rgba(255,255,255,0.05)",
          background: "rgba(26,23,15,0.55)",
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.13em] text-[#F5F2D8]/40 mb-1">
              CV Score
            </p>
            <div className="flex items-baseline gap-1.5">
              <span
                className="text-[32px] font-black leading-none"
                style={{
                  color: scoreGrade?.color ?? "#F5F2D8",
                  textShadow: scoreGrade
                    ? `0 0 24px ${scoreGrade.color}55`
                    : undefined,
                }}
              >
                {overallScore ?? "—"}
              </span>
              <span className="text-[13px] font-bold text-[#F5F2D8]/35">/100</span>
            </div>
            {scoreGrade && (
              <span
                className="mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider"
                style={{
                  background: `color-mix(in srgb, ${scoreGrade.color} 18%, transparent)`,
                  color: scoreGrade.color,
                }}
              >
                {scoreGrade.label}
              </span>
            )}
          </div>

          {/* AI confidence */}
          <div
            className="flex items-center gap-1 rounded-xl px-2.5 py-1.5"
            style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.15)" }}
          >
            <Bot className="h-3 w-3 text-[#8B5CF6]/70" aria-hidden="true" />
            <span className="text-[10px] font-bold text-[#8B5CF6]/70">AI</span>
          </div>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 min-h-0 overflow-y-auto">

        {/* Accordion stack */}
        <div className="flex flex-col gap-1.5 p-2.5">

          <AccordionSection
            tabId="overview"
            title="Overview"
            subtitle={overallScore !== null ? `${overallScore}/100 overall` : "Overall health"}
            accentColor="#CAFF43"
            Icon={LayoutDashboard}
          >
            <p className="text-[12px] leading-relaxed text-[#F5F2D8]/80">
              {atsCompatibility !== null ? (
                atsCompatibility >= 80 ? "ATS compatibility looks strong. Format and structure are well-optimized for parsing." :
                atsCompatibility >= 50 ? "Some parsing warnings identified. Consider simplifying your format to improve machine readability." :
                "Critical formatting issues detected. ATS parsers may struggle to read your CV."
              ) : "Section structure will be evaluated once analysis connects."}
            </p>
          </AccordionSection>

          <AccordionSection
            tabId="scores"
            title="Scores"
            subtitle={
              clarityScore !== null && impactScore !== null
                ? `Clarity ${clarityScore} · Impact ${impactScore}`
                : "Per-dimension scores"
            }
            accentColor="#FF8C42"
            Icon={BarChart2}
          >
            <div className="flex flex-col gap-3">
              {[
                { label: "Clarity", score: clarityScore, color: "#CAFF43", delay: 0 },
                { label: "Impact", score: impactScore, color: "#FF8C42", delay: 80 },
                { label: "ATS Compat.", score: atsCompatibility, color: "#8B5CF6", delay: 160 },
              ].map(({ label, score, color, delay }) => (
                <div key={label} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#F5F2D8]/70">
                      {label}
                    </span>
                    <span className="text-[12px] font-bold" style={{ color: score !== null ? color : undefined }}>
                      {score !== null ? `${score}%` : "—"}
                    </span>
                  </div>
                  <ScoreBar score={score} color={color} delay={delay} />
                </div>
              ))}
            </div>
          </AccordionSection>

          <AccordionSection
            tabId="suggestions"
            title="AI Suggestions"
            subtitle={suggestionCount > 0 ? `${suggestionCount} active` : "No suggestions yet"}
            accentColor="#CAFF43"
            Icon={Lightbulb}
          >
            <div className="flex items-center gap-2">
              <span
                className="rounded-full px-2.5 py-1 text-[11px] font-black"
                style={{ background: "rgba(202,255,67,0.15)", color: "#CAFF43" }}
              >
                {suggestionCount > 0 ? `${suggestionCount} ready` : "0 suggestions"}
              </span>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-[#F5F2D8]/80">
              {suggestionCount > 0
                ? `${suggestionCount} rewrite candidates ready to apply.`
                : "AI suggestions will appear after analysis completes."}
            </p>
          </AccordionSection>

          <AccordionSection
            tabId="grammar"
            title="Grammar"
            subtitle={grammarIssues.length > 0 ? `${grammarIssues.length} issues found` : "No critical errors"}
            accentColor="#8B5CF6"
            Icon={CheckCircle2}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="h-3.5 w-3.5" style={{ color: grammarIssues.length > 0 ? "#FF8C42" : "#8B5CF6" }} aria-hidden="true" />
              <span className="text-[11px] font-bold" style={{ color: grammarIssues.length > 0 ? "#FF8C42" : "#8B5CF6" }}>
                {grammarIssues.length > 0 ? "Review needed" : "All clear"}
              </span>
            </div>
            <p className="text-[12px] leading-relaxed text-[#F5F2D8]/80">
              {grammarIssues.length > 0 
                ? `${grammarIssues.length} language, spelling, or stylistic issues identified.`
                : "Grammar is generally solid. Main focus is style precision and authority tone."}
            </p>
          </AccordionSection>

          <AccordionSection
            tabId="skills"
            title="Skills"
            subtitle={skillsCount > 0 ? `${skillsCount} skills detected` : "Skill distribution"}
            accentColor="#FF4FCB"
            Icon={Layers}
          >
            <p className="text-[12px] leading-relaxed text-[#F5F2D8]/80">
              {skillsCount > 0
                ? `${skillsCount} skills successfully extracted from your CV text. Expand details to see the full breakdown.`
                : "Skill profile will appear here once data is connected."}
            </p>
          </AccordionSection>
        </div>

        {/* ── Live Chat stub ── */}
        <div
          className="mx-2.5 mb-2.5 overflow-hidden rounded-2xl border mt-2"
          style={{
            background: "rgba(139,92,246,0.04)",
            borderColor: "rgba(139,92,246,0.12)",
          }}
        >
          {/* Chat header */}
          <div
            className="flex items-center gap-2.5 border-b px-3.5 py-2.5"
            style={{
              borderColor: "rgba(139,92,246,0.08)",
              background: "linear-gradient(135deg, rgba(139,92,246,0.08) 0%, transparent 100%)",
            }}
          >
            <div
              className="flex h-7 w-7 flex-none items-center justify-center rounded-xl"
              style={{ background: "rgba(139,92,246,0.18)" }}
            >
              <Bot className="h-4 w-4 text-[#8B5CF6]" aria-hidden="true" />
            </div>
            <div>
              <h3 className="font-display text-[12px] font-bold text-[#F5F2D8]/90 leading-tight">
                AI Copilot
              </h3>
              <p className="text-[10px] text-[#F5F2D8]/60 leading-tight">
                Contextual CV assistant
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <span
                className="h-1.5 w-1.5 rounded-full animate-pulse"
                style={{ background: "#8B5CF6" }}
                aria-hidden="true"
              />
              <span className="text-[10px] font-bold text-[#8B5CF6]/60">Online</span>
            </div>
          </div>

          {/* Bot message bubble */}
          <div className="px-3.5 pt-3 pb-2">
            <div
              className="rounded-xl px-3 py-2.5"
              style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.1)" }}
            >
              <p className="text-[11px] leading-relaxed text-[#F5F2D8]/90">
                {"I've found a few priority areas. Click a suggestion or ask me to rewrite a section."}
              </p>
            </div>
          </div>

          {/* Quick prompts */}
          <div className="flex flex-wrap gap-1.5 px-3.5 pb-3">
            {["Rewrite summary", "Improve bullets", "Explain score"].map((preset) => (
              <button
                key={preset}
                type="button"
                className="rounded-full border px-2.5 py-1 text-[10px] font-semibold transition-colors hover:bg-[rgba(139,92,246,0.1)]"
                style={{
                  borderColor: "rgba(139,92,246,0.12)",
                  color: "rgba(245,242,216,0.80)",
                  background: "rgba(139,92,246,0.08)",
                }}
              >
                {preset}
              </button>
            ))}
          </div>

          {/* Input row */}
          <div
            className="flex items-center gap-2 border-t px-3 py-2.5"
            style={{ borderColor: "rgba(139,92,246,0.08)" }}
          >
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask AI to refine, explain…"
              className="min-w-0 flex-1 bg-transparent text-[11px] text-[#F5F2D8] placeholder:text-[#F5F2D8]/50 outline-none"
            />
            <button
              type="submit"
              aria-label="Send message"
              className="flex h-7 w-7 flex-none items-center justify-center rounded-lg transition-colors hover:bg-[rgba(139,92,246,0.25)]"
              style={{ background: "rgba(139,92,246,0.18)" }}
            >
              <Send className="h-3.5 w-3.5 text-[#8B5CF6]/90" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
