"use client";
/**
 * RightRailStats — right summary rail for workspace-v2.
 * Accordion sections are SYNCED with left panel via activeDetailTab.
 * Purely store-driven: no local open state — guarantees bidirectional sync.
 * Clicking accordion header or left panel both call setActiveDetailTab(tabId).
 */
import { useState } from "react";
import { ChevronDown, Send } from "lucide-react";
import { AccentPill } from "@/components/ui/accent-pill";
import { useWorkspaceV2Store } from "@/lib/stores/workspace-v2-store";
import { cn } from "@/lib/utils";

interface RightRailStatsProps {
  className?: string;
}

type TabId = "overview" | "scores" | "suggestions" | "grammar" | "skills";

// ── Accordion section — purely store-driven (bidirectional) ───────────────────
interface AccordionSectionProps {
  tabId: TabId;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

function AccordionSection({ tabId, title, subtitle, children }: AccordionSectionProps) {
  const { activeDetailTab, setActiveDetailTab } = useWorkspaceV2Store();
  // isOpen is purely derived from store — no local state needed
  const isOpen = activeDetailTab === tabId;

  const handleToggle = () => {
    setActiveDetailTab(isOpen ? null : tabId);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-[--ws-border] bg-[rgba(255,255,255,0.55)]">
      <button
        type="button"
        onClick={handleToggle}
        className="flex w-full items-center justify-between gap-2 px-4 py-3.5 text-left transition-colors hover:bg-[--ws-surface-hover]"
      >
        <div className="min-w-0 flex-1">
          <p className="font-display text-[14px] font-bold text-[--ws-ink]">{title}</p>
          <p className="mt-0.5 text-[11px] text-[--ws-ink-ghost]">{subtitle}</p>
        </div>
        <div
          className={cn(
            "grid h-6 w-6 flex-none place-items-center rounded-full",
            "bg-[rgba(17,17,17,0.06)] transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        >
          <ChevronDown className="h-3 w-3 text-[--ws-ink-ghost]" aria-hidden="true" />
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-[--ws-border] px-4 pb-4 pt-3">
          {children}
          <button
            type="button"
            onClick={() => setActiveDetailTab(tabId)}
            className="mt-3 text-[11px] font-bold uppercase tracking-wider text-[#111111] underline underline-offset-2 transition-opacity hover:opacity-60"
          >
            {"View details ->"}
          </button>
        </div>
      )}
    </section>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
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

  // ATS compatibility = % of checks with status "pass"
  const atsCompatibility =
    atsChecks.length > 0
      ? Math.round((atsChecks.filter((c) => c.status === "pass").length / atsChecks.length) * 100)
      : null;

  return (
    <div className={cn("flex h-full flex-col bg-[--ws-surface] overflow-hidden", className)}>
      {/* Panel title */}
      <div className="flex-none border-b border-[--ws-border] px-4 py-3">
        <h2 className="font-display text-[15px] font-extrabold text-[--ws-ink]">
          {"Summary "}
          <AccentPill color="orange" size="sm">Rail</AccentPill>
        </h2>
        <p className="mt-0.5 text-[11px] text-[--ws-ink-ghost]">
          Quick summary of each analysis section
        </p>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto">

        {/* Accordion stack */}
        <div className="flex flex-col gap-2 p-3">

          <AccordionSection
            tabId="overview"
            title="Overview"
            subtitle={overallScore !== null ? `${overallScore} overall health` : "Overall health score"}
          >
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-[28px] font-extrabold leading-none text-[#111111]">
                {overallScore ?? "—"}
              </span>
              <span className="text-xs text-[--ws-ink-ghost]">/ 100</span>
            </div>
            <p className="text-[12px] leading-relaxed text-[--ws-ink-secondary]">
              Section structure is readable. Main focus area is phrasing and ownership language.
            </p>
          </AccordionSection>

          <AccordionSection
            tabId="scores"
            title="Scores"
            subtitle={
              clarityScore !== null && impactScore !== null
                ? `Clarity ${clarityScore} / Impact ${impactScore}`
                : "Scores per dimension"
            }
          >
            <div className="flex flex-col gap-2.5">
              {[
                { label: "Clarity", score: clarityScore, color: "#CAFF43" },
                { label: "Impact", score: impactScore, color: "#FF8C42" },
                {
                  label: "ATS Compatibility",
                  score: atsCompatibility,
                  color: "#8B5CF6",
                },
              ].map(({ label, score, color }) => (
                <div key={label} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[--ws-ink-ghost]">
                      {label}
                    </span>
                    <span className="text-[12px] font-bold text-[--ws-ink-secondary]">
                      {score !== null ? `${score}%` : "—"}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(17,17,17,0.08)]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${score ?? 0}%`, background: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </AccordionSection>

          <AccordionSection
            tabId="suggestions"
            title="AI Suggestions"
            subtitle={suggestionCount > 0 ? `${suggestionCount} active` : "No suggestions yet"}
          >
            <p className="text-[12px] leading-relaxed text-[--ws-ink-secondary]">
              {suggestionCount > 0
                ? `${suggestionCount} rewrite candidates ready to apply.`
                : "AI suggestions will appear after analysis completes."}
            </p>
          </AccordionSection>

          <AccordionSection
            tabId="grammar"
            title="Grammar"
            subtitle="No critical errors"
          >
            <p className="text-[12px] leading-relaxed text-[--ws-ink-secondary]">
              Grammar is generally solid. Main focus is style precision and authority tone.
            </p>
          </AccordionSection>

          <AccordionSection
            tabId="skills"
            title="Skills"
            subtitle="Skill distribution analysis"
          >
            <p className="text-[12px] leading-relaxed text-[--ws-ink-secondary]">
              Skill profile will appear here once data is connected.
            </p>
          </AccordionSection>
        </div>

        {/* Live Chat stub */}
        <div className="mx-3 mb-3 overflow-hidden rounded-2xl border border-[--ws-border] bg-[rgba(255,255,255,0.65)]">
          <div className="flex items-center justify-between border-b border-[--ws-border] px-4 py-3">
            <div>
              <h3 className="font-display text-[13px] font-extrabold text-[--ws-ink]">
                {"Live "}
                <AccentPill color="purple" size="sm">Chat</AccentPill>
              </h3>
              <p className="mt-0.5 text-[10px] text-[--ws-ink-ghost]">
                Contextual copilot for your CV
              </p>
            </div>
          </div>

          <div className="px-4 py-3">
            <div className="rounded-xl bg-[rgba(17,17,17,0.04)] px-3 py-2.5">
              <p className="text-[12px] leading-relaxed text-[--ws-ink-secondary]">
                {"I've found a few priority areas. Click a suggestion or ask me to rewrite a section."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 px-4 pb-3">
            {["Rewrite summary", "Improve bullets", "Explain score"].map((preset) => (
              <button
                key={preset}
                type="button"
                disabled
                className="rounded-full border border-[--ws-border] px-2.5 py-1 text-[11px] font-semibold text-[--ws-ink-ghost] opacity-50 cursor-not-allowed"
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t border-[--ws-border] px-3 py-2.5">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask AI to refine, explain, or rewrite..."
              disabled
              className="min-w-0 flex-1 bg-transparent text-[12px] text-[--ws-ink-secondary] placeholder:text-[--ws-ink-ghost] outline-none disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled
              aria-label="Send message"
              className="flex h-7 w-7 flex-none items-center justify-center rounded-lg bg-[#111111] text-[#F5F2D8] opacity-40 cursor-not-allowed"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
