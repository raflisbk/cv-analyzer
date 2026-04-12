"use client";
/**
 * LeftPanelToggle — toggle button untuk left detail panel.
 * Posisi: absolute left-0 top-1/2 pada center PDF panel (diatur dari parent).
 * Ukuran visual 28x28, touch target 44x44 via before: pseudo-element.
 * (UI-SPEC Section 3)
 */
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useWorkspaceV2Store } from "@/lib/stores/workspace-v2-store";
import { cn } from "@/lib/utils";

interface LeftPanelToggleProps {
  className?: string;
}

export function LeftPanelToggle({ className }: LeftPanelToggleProps) {
  const { leftPanelOpen, toggleLeftPanel } = useWorkspaceV2Store();

  return (
    <button
      onClick={toggleLeftPanel}
      aria-label={leftPanelOpen ? "Tutup detail panel" : "Buka detail panel"}
      aria-expanded={leftPanelOpen}
      className={cn(
        // Ukuran visual 28x28
        "relative flex h-7 w-7 items-center justify-center",
        // Styling
        "rounded-full border border-[--ws-border] bg-[--ws-surface] shadow-md",
        "text-[--ws-ink-secondary] transition-colors duration-150",
        "hover:bg-[--ws-surface-hover]",
        // Accessibility: touch target 44x44 via before pseudo-element
        "before:absolute before:inset-[-8px] before:content-['']",
        className
      )}
    >
      {leftPanelOpen ? (
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
      )}
    </button>
  );
}
