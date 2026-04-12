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
      <div className="rounded-2xl border border-[--ws-border] bg-[rgba(17,17,17,0.03)] p-4">
        <p className="text-xs text-[--ws-ink-ghost]">No AI suggestions available yet.</p>
      </div>
    );
  }

  const allCards: Array<{
    suggestionId: string;
    section: string;
    text: string;
    priority: string;
    afterText?: string | null;
  }> = [];

  suggestions.forEach((card, cardIdx) => {
    card.suggestions.forEach((item, itemIdx) => {
      allCards.push({
        suggestionId: `${card.section}_${itemIdx}_${cardIdx}`,
        section: card.section,
        text: item.text,
        priority: item.priority,
        afterText: item.afterText,
      });
    });
  });

  return (
    <div className="flex flex-col gap-2">
      {allCards.map(({ suggestionId, section, text, priority, afterText }) => {
        const isActive = activeSuggestionId === suggestionId;
        const isHighImpact = priority === "high_impact";

        return (
          <div
            key={suggestionId}
            ref={(el) => {
              if (el) { cardRefs.current.set(suggestionId, el); }
              else { cardRefs.current.delete(suggestionId); }
            }}
            className="rounded-2xl border p-3 transition-all duration-150"
            style={{
              borderColor: isActive
                ? isHighImpact
                  ? "rgba(239,68,68,0.5)"
                  : "rgba(245,158,11,0.5)"
                : "var(--ws-border)",
              background: isActive
                ? isHighImpact
                  ? "rgba(239,68,68,0.06)"
                  : "rgba(245,158,11,0.06)"
                : "rgba(255,255,255,0.55)",
              boxShadow: isActive ? "0 0 0 2px rgba(202,255,67,0.3)" : undefined,
            }}
          >
            <div className="mb-1 flex items-center gap-1.5">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-[--ws-ink-ghost]">
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

            <p className="text-[12px] leading-relaxed text-[--ws-ink-secondary]">{text}</p>

            {afterText && (
              <p className="mt-1.5 text-[11px] italic leading-relaxed text-[--ws-ink-ghost] border-l-2 border-[--ws-border] pl-2">
                {afterText}
              </p>
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
  const suggestions = useWorkspaceV2Store(
    (s) => (s.hydration?.analysis?.suggestions ?? null) as SuggestionCard[] | null
  );
  const cardRefs = useRef<Map<string, HTMLElement>>(new Map());

  const isDetailFocus = activeDetailTab !== null;
  const currentTab = TABS.find((t) => t.id === activeDetailTab);

  useEffect(() => {
    if (!activeSuggestionId) { return; }
    const el = cardRefs.current.get(activeSuggestionId);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeSuggestionId]);

  return (
    <div className={cn("flex flex-col h-full bg-[--ws-surface] overflow-hidden", className)}>
      {isDetailFocus ? (
        // ── Detail focus mode ────────────────────────────────────────────
        <>
          {/* Toolbar: Back + tab switcher */}
          <div className="flex items-center gap-1.5 border-b border-[--ws-border] px-3 py-2 flex-none">
            <button
              onClick={() => setActiveDetailTab(null)}
              aria-label="Back to PDF"
              className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-[--ws-ink-ghost] hover:text-[--ws-ink] transition-colors flex-none mr-1"
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
                      : "border border-[--ws-border] text-[--ws-ink-ghost] hover:border-[--ws-border-strong] hover:text-[--ws-ink-secondary]"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Detail content area */}
          <div className="flex-1 overflow-y-auto p-4">
            <p className="font-display mb-3 text-[11px] font-bold uppercase tracking-widest text-[--ws-ink-ghost]">
              {currentTab?.label}
            </p>
            {activeDetailTab === "suggestions" ? (
              <SuggestionsTabContent
                suggestions={suggestions}
                activeSuggestionId={activeSuggestionId}
                cardRefs={cardRefs}
              />
            ) : (
              <div className="rounded-2xl border border-[--ws-border] bg-[rgba(17,17,17,0.03)] p-4">
                <p className="text-xs leading-relaxed text-[--ws-ink-ghost]">
                  <strong className="text-[--ws-ink-secondary]">{currentTab?.label}</strong>{" "}
                  detail will be available once analysis data is connected.
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        // ── Compact mode — vertical tab list (210px wide) ───────────────
        <>
          <div className="border-b border-[--ws-border] px-4 py-3 flex-none">
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
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[--ws-surface-active] transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[--ws-ink-secondary] group-hover:text-[--ws-ink] transition-colors truncate">
                    {tab.label}
                  </p>
                  <p className="text-[10px] text-[--ws-ink-ghost] truncate">
                    {tab.subtitle}
                  </p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-[--ws-border-strong] flex-none group-hover:text-[--ws-ink-ghost] transition-colors" />
              </button>
            ))}
          </nav>
        </>
      )}
    </div>
  );
}
