"use client";
/**
 * LeftDetailPanel — always-visible left panel for workspace-v2.
 * Compact mode (no tab selected): narrow 210px strip with vertical tab list.
 * Detail focus (tab selected): expanded panel with tab switcher + content + Back button.
 * Grid column expansion is driven by the parent shell grid via activeDetailTab.
 */
import { ArrowLeft, ChevronRight } from "lucide-react";
import { AccentPill } from "@/components/ui/accent-pill";
import { useWorkspaceV2Store } from "@/lib/stores/workspace-v2-store";
import { cn } from "@/lib/utils";

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

export function LeftDetailPanel({ className }: LeftDetailPanelProps) {
  const { activeDetailTab, setActiveDetailTab } = useWorkspaceV2Store();
  const isDetailFocus = activeDetailTab !== null;
  const currentTab = TABS.find((t) => t.id === activeDetailTab);

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
            <div className="rounded-2xl border border-[--ws-border] bg-[rgba(17,17,17,0.03)] p-4">
              <p className="text-xs leading-relaxed text-[--ws-ink-ghost]">
                <strong className="text-[--ws-ink-secondary]">{currentTab?.label}</strong>{" "}
                detail will be available once analysis data is connected.
              </p>
            </div>
          </div>
        </>
      ) : (
        // ── Compact mode — vertical tab list (210px wide) ───────────────
        <>
          <div className="border-b border-[--ws-border] px-4 py-3 flex-none">
            <p className="font-display text-[12px] font-extrabold text-[--ws-ink]">
              Analysis{" "}
              <AccentPill color="lime" size="sm">Details</AccentPill>
            </p>
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
