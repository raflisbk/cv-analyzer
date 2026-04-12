"use client";
/**
 * LeftDetailPanel — left panel workspace-v2.
 * Phase 13: stub tabs saja — data wiring di Phase 15.
 * Tab labels: Ringkasan, Skor, Saran AI, Tata Bahasa.
 */
import { useState } from "react";
import { cn } from "@/lib/utils";

type TabId = "ringkasan" | "skor" | "saran" | "tatabahasa";

const TABS: { id: TabId; label: string }[] = [
  { id: "ringkasan", label: "Ringkasan" },
  { id: "skor", label: "Skor" },
  { id: "saran", label: "Saran AI" },
  { id: "tatabahasa", label: "Tata Bahasa" },
];

interface LeftDetailPanelProps {
  className?: string;
}

export function LeftDetailPanel({ className }: LeftDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>("ringkasan");

  return (
    <div className={cn("flex flex-col h-full bg-[--ws-surface]", className)}>
      {/* Panel header */}
      <div className="flex items-center justify-between p-4 border-b border-[--ws-border]">
        <h2 className="text-[15px] font-bold text-[--ws-ink]">
          Detail Analisis
        </h2>
      </div>

      {/* Tab buttons — visual only, Phase 13 stub */}
      <div className="flex flex-wrap gap-1.5 px-4 pt-3 pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-widest transition-colors duration-150",
              activeTab === tab.id
                ? "bg-[--ws-surface-active] text-[--ws-ink-secondary]"
                : "border border-[--ws-border] bg-transparent text-[--ws-ink-ghost] hover:text-[--ws-ink-secondary]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content — Phase 13 placeholder */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="rounded-xl border border-[--ws-border] bg-[--ws-surface-active] p-4">
          <p className="text-xs leading-relaxed text-[--ws-ink-ghost]">
            Detail analisis tersedia setelah proses selesai. Panel ini akan diisi pada Fase 15.
          </p>
        </div>
      </div>
    </div>
  );
}
