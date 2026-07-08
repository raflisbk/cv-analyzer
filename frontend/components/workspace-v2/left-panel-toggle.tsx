"use client";

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
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        {isOpen ? (
          <path d="M7 1L3 5L7 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M3 1L7 5L3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}
