"use client";
/**
 * LeftDetailPanel — always-visible left panel for workspace-v2.
 * Compact mode (no tab selected): narrow 210px strip with vertical tab list.
 * Detail focus (tab selected): expanded panel with tab switcher + content + Back button.
 * Grid column expansion is driven by the parent shell grid via activeDetailTab.
 */
import { useEffect, useRef } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useWorkspaceV2Store } from "@/lib/stores/workspace-v2-store";
import { cn } from "@/lib/utils";
import type { SuggestionCard } from "@/lib/types";
import { AtsChecklist } from "@/components/results/ats-checklist";
import { ScoreDashboard } from "@/components/results/score-dashboard";
import { GrammarIssuesList } from "@/components/results/grammar-issues-list";
import { SkillsList } from "@/components/results/skills-list";

type TabId = "overview" | "scores" | "suggestions" | "grammar" | "skills";

const TABS: { id: TabId; label: string; subtitle: string }[] = [
  { id: "overview",     label: "Overview",       subtitle: "ATS & narrative summary" },
  { id: "scores",       label: "Scores",          subtitle: "Clarity, impact, structure" },
  { id: "suggestions",  label: "AI Suggestions",  subtitle: "Rewrite candidates" },
  { id: "grammar",      label: "Grammar",         subtitle: "Language & tone issues" },
  { id: "skills",       label: "Skills",          subtitle: "Skill distribution" },
];

interface LeftDetailPanelProps {
  className?: string;
}

interface SuggestionsTabContentProps {
  suggestions: SuggestionCard[] | null;
  activeSuggestionId: string | null;
  cardRefs: React.MutableRefObject<Map<string, HTMLElement>>;
}

function SuggestionsTabContent({
  suggestions,
  activeSuggestionId,
  cardRefs,
}: SuggestionsTabContentProps) {
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="rounded-2xl border border-[#F5F2D8]/[0.08] bg-[#F5F2D8]/[0.02] p-4">
        <p className="text-xs text-[#F5F2D8]/50">No AI suggestions available yet.</p>
      </div>
    );
  }

  const allCards: Array<{
    suggestionId: string;
    section: string;
    text: string;
    explanation?: string;
    priority: string;
    originalText?: string | null;
    afterText?: string | null;
  }> = [];

  suggestions.forEach((card, cardIdx) => {
    card.suggestions.forEach((item, itemIdx) => {
      allCards.push({
        suggestionId: `${card.section}_${itemIdx}_${cardIdx}`,
        section: card.section,
        text: item.text,
        explanation: item.explanation,
        priority: item.priority,
        originalText: (item as any).originalText || (item as any).original_text,
        afterText: (item as any).afterText || (item as any).after_text,
      });
    });
  });

  return (
    <div className="flex flex-col gap-2">
      {allCards.map(({ suggestionId, section, text, explanation, priority, originalText, afterText }) => {
        const isActive = activeSuggestionId === suggestionId;
        const isHighImpact = priority === "high_impact";

        return (
          <div
            key={suggestionId}
            ref={(el) => {
              if (el) { cardRefs.current.set(suggestionId, el); }
              else { cardRefs.current.delete(suggestionId); }
            }}
            className="rounded-2xl border p-3.5 transition-all duration-150 flex flex-col gap-2.5"
            style={{
              borderColor: isActive
                ? isHighImpact
                  ? "rgba(239,68,68,0.5)"
                  : "rgba(245,158,11,0.5)"
                : "var(--ws-border)",
              background: isActive
                ? "rgba(245,242,216,0.06)"
                : "rgba(245,242,216,0.02)",
              boxShadow: isActive ? "0 0 0 2px rgba(202,255,67,0.3)" : undefined,
            }}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#F5F2D8]/60">
                {section}
              </span>
              <span
                className="rounded-full px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider"
                style={{
                  background: isHighImpact
                    ? "rgba(239,68,68,0.15)"
                    : "rgba(245,158,11,0.15)",
                  color: isHighImpact ? "#ef4444" : "#f59e0b",
                }}
              >
                {isHighImpact ? "High Impact" : "Quick Win"}
              </span>
            </div>

            <p className="text-[13px] font-medium leading-relaxed text-[#F5F2D8]">{text}</p>
            
            {explanation && (
              <div className="rounded-lg bg-[#CAFF43]/10 p-2 border border-[#CAFF43]/20">
                <p className="text-[11px] leading-relaxed text-[#CAFF43] font-medium">
                  <span className="font-bold">Why: </span>{explanation}
                </p>
              </div>
            )}

            {(originalText || afterText) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                {originalText && (
                  <div className="rounded p-2 bg-red-500/10 border border-red-500/20">
                    <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest mb-1">Before</p>
                    <p className="text-[11px] text-red-200 line-through decoration-red-500/50">{originalText}</p>
                  </div>
                )}
                {afterText && (
                  <div className="rounded p-2 bg-green-500/10 border border-green-500/20">
                    <p className="text-[9px] font-bold text-green-400 uppercase tracking-widest mb-1">After</p>
                    <p className="text-[11px] text-green-200">{afterText}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function LeftDetailPanel({ className }: LeftDetailPanelProps) {
  const { activeDetailTab, setActiveDetailTab } = useWorkspaceV2Store();
  const activeSuggestionId = useWorkspaceV2Store((s) => s.activeSuggestionId);
  const analysis = useWorkspaceV2Store((s) => s.hydration?.analysis ?? null);
  const suggestions = (analysis?.suggestions ?? null) as SuggestionCard[] | null;
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());

  const isDetailFocus = activeDetailTab !== null;
  const currentTab = TABS.find((t) => t.id === activeDetailTab);

  useEffect(() => {
    if (!activeSuggestionId) { return; }
    const el = cardRefs.current.get(activeSuggestionId);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeSuggestionId]);

  return (
    <div className={cn("flex flex-col h-full overflow-hidden", className)}>
      {isDetailFocus ? (
        // ── Detail focus mode ────────────────────────────────────────────
        <>
          {/* Toolbar: Back + tab switcher */}
          <div className="flex items-center gap-1.5 border-b border-[#F5F2D8]/[0.08] px-3 py-2 flex-none">
            <button
              onClick={() => setActiveDetailTab(null)}
              aria-label="Back to PDF"
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-[#F5F2D8]/60 hover:text-[#F5F2D8] transition-colors flex-none mr-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>PDF</span>
            </button>

            <div className="flex flex-wrap gap-1 flex-1 min-w-0">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDetailTab(tab.id)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors duration-150 flex-none",
                    activeDetailTab === tab.id
                      ? "bg-[#CAFF43] text-[#111111]"
                      : "border border-[#F5F2D8]/[0.12] text-[#F5F2D8]/60 hover:border-[#F5F2D8]/30 hover:text-[#F5F2D8]/90"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Detail content area */}
          <div className="flex-1 overflow-y-auto p-4">
            <p className="font-display mb-3 text-[11px] font-bold uppercase tracking-widest text-[#F5F2D8]/60">
              {currentTab?.label}
            </p>
            {activeDetailTab === "suggestions" ? (
              <SuggestionsTabContent
                suggestions={suggestions}
                activeSuggestionId={activeSuggestionId}
                cardRefs={cardRefs}
              />
            ) : activeDetailTab === "overview" && analysis?.ats_checks ? (
              <div className="space-y-4">
                <AtsChecklist checks={analysis.ats_checks} />
              </div>
            ) : activeDetailTab === "scores" && analysis?.scores ? (
              <div className="space-y-4 flex flex-col">
                <ScoreDashboard scores={analysis.scores} />
                <div className="rounded-xl border border-[#F5F2D8]/10 bg-[#F5F2D8]/[0.02] p-4 text-xs text-[#F5F2D8]/70 leading-relaxed mt-2">
                  <p className="font-semibold text-[#F5F2D8]">How is this calculated?</p>
                  <p className="mt-1">
                    Scores are generated by an advanced AI (Hugging Face BGE-M3 Embeddings) representing semantic alignment with industry standards, rather than a rigid rules-based engine. 
                  </p>
                </div>
              </div>
            ) : activeDetailTab === "grammar" && Array.isArray(analysis?.grammar_issues) ? (
              <div className="space-y-4">
                <GrammarIssuesList issues={analysis.grammar_issues} />
              </div>
            ) : activeDetailTab === "skills" && Array.isArray(analysis?.skills) ? (
              <div className="space-y-4">
                <SkillsList skills={analysis.skills} />
              </div>
            ) : (
              <div className="rounded-2xl border border-[#F5F2D8]/[0.08] bg-[#F5F2D8]/[0.02] p-4">
                <p className="text-xs leading-relaxed text-[#F5F2D8]/70">
                  <strong className="text-[#F5F2D8]"> {currentTab?.label} </strong>
                  detail will be available once analysis data is connected.
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        // ── Compact mode — vertical tab list (210px wide) ───────────────
        <>
          <div className="border-b border-[#F5F2D8]/[0.08] px-4 py-3 flex-none">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide font-display"
                style={{ background: "#141414", color: "#F5F2D8" }}
              >
                Analysis
              </span>
              <span
                className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-extrabold tracking-wide font-display"
                style={{ background: "#CAFF43", color: "#141414" }}
              >
                Details
              </span>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-1" aria-label="Analysis tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveDetailTab(tab.id)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[#F5F2D8]/[0.04] transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#F5F2D8]/80 group-hover:text-[#F5F2D8] transition-colors truncate">
                    {tab.label}
                  </p>
                  <p className="text-[10px] text-[#F5F2D8]/50 truncate">
                    {tab.subtitle}
                  </p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-[#F5F2D8]/20 flex-none group-hover:text-[#F5F2D8]/60 transition-colors" />
              </button>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}
