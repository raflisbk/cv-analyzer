"use client";
/**
 * LeftPanelToggle — kept for compatibility; not mounted in the current shell.
 * The grid-based layout (Phase 13+) uses tab clicks in LeftDetailPanel to drive
 * activeDetailTab state instead of a separate toggle button.
 */
import { useWorkspaceV2Store } from "@/lib/stores/workspace-v2-store";
import { cn } from "@/lib/utils";

interface LeftPanelToggleProps {
  className?: string;
}

export function LeftPanelToggle({ className }: LeftPanelToggleProps) {
  const { activeDetailTab, setActiveDetailTab } = useWorkspaceV2Store();
  const isOpen = activeDetailTab !== null;

  return (
    <button
      onClick={() => setActiveDetailTab(isOpen ? null : "ringkasan")}
      aria-label={isOpen ? "Tutup detail panel" : "Buka detail panel"}
      aria-expanded={isOpen}
      className={cn(
        "relative flex h-7 w-7 items-center justify-center",
        "rounded-full border border-[rgba(255,255,255,0.18)] bg-[#2A2A2A] shadow-lg",
        "text-[--ws-ink] transition-colors duration-150",
        "hover:bg-[#333333] hover:border-[rgba(255,255,255,0.28)]",
        "before:absolute before:inset-[-8px] before:content-['']",
        className
      )}
    >
      <span className="text-[11px] font-bold">{isOpen ? "←" : "→"}</span>
    </button>
  );
}
