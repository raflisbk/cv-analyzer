"use client";
/**
 * RightRailStats — right rail dengan summary stats.
 * Phase 13: skor keseluruhan, jumlah saran, jumlah isu grammar, chat coming soon.
 * Data dari WorkspaceHydration.analysis.
 * (UI-SPEC Section 5 — Right Rail Stats Design Contract)
 */
import { Lightbulb, FileText } from "lucide-react";
import { useWorkspaceV2Store } from "@/lib/stores/workspace-v2-store";
import { cn } from "@/lib/utils";

interface RightRailStatsProps {
  className?: string;
}

export function RightRailStats({ className }: RightRailStatsProps) {
  const { hydration } = useWorkspaceV2Store();

  const analysis = hydration?.analysis;

  // Hitung total suggestion count dari semua section cards
  const suggestionCount = analysis?.suggestions
    ? analysis.suggestions.flatMap((card) => card.suggestions).length
    : 0;

  // Grammar issues count
  // NOTE: grammar_issues tidak ada di WorkspaceAnalysisContext saat ini.
  // Akan ditambahkan di Phase 15. Sementara ini tampilkan 0.
  const grammarCount = 0;

  const overallScore = analysis?.scores?.overall ?? null;

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-[--ws-surface] border-l border-[--ws-border] overflow-y-auto p-4",
        className
      )}
    >
      {/* Panel title */}
      <h2 className="mb-4 text-[15px] font-bold text-[--ws-ink]">
        Ringkasan
      </h2>

      {/* Score card */}
      <div
        className="mb-4 rounded-xl border border-[--ws-border-accent] bg-[--ws-surface-active] p-4"
        aria-label={`Skor Keseluruhan: ${overallScore ?? 0} dari 100`}
      >
        <p className="mb-1 text-xs font-bold uppercase tracking-widest text-[--ws-ink-ghost]">
          Skor Keseluruhan
        </p>
        <div className="flex items-baseline gap-1">
          <span className="text-[32px] font-bold leading-none text-[--ws-accent]">
            {overallScore ?? "—"}
          </span>
          <span className="text-sm font-normal text-[--ws-ink-ghost]">
            / 100
          </span>
        </div>
      </div>

      {/* Stat rows */}
      {/* AI Suggestions */}
      <div className="flex items-center gap-3 border-b border-[--ws-border] py-3">
        <Lightbulb
          className="h-3.5 w-3.5 flex-none text-[--ws-accent]"
          aria-hidden="true"
        />
        <div className="flex items-baseline gap-1.5">
          <span className="text-[15px] font-bold text-[--ws-ink]">
            {suggestionCount}
          </span>
          <span className="text-xs text-[--ws-ink-secondary]">
            saran perbaikan
          </span>
        </div>
      </div>

      {/* Grammar Issues */}
      <div className="flex items-center gap-3 border-b border-[--ws-border] py-3">
        <FileText
          className="h-3.5 w-3.5 flex-none text-[--ws-ink-secondary]"
          aria-hidden="true"
        />
        <div className="flex items-baseline gap-1.5">
          <span className="text-[15px] font-bold text-[--ws-ink]">
            {grammarCount}
          </span>
          <span className="text-xs text-[--ws-ink-secondary]">
            isu tata bahasa
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 h-px w-full bg-[--ws-border]" aria-hidden="true" />

      {/* Chat stub */}
      <p className="text-center text-xs leading-relaxed text-[--ws-ink-ghost]">
        Asisten chat segera hadir
      </p>
    </div>
  );
}
