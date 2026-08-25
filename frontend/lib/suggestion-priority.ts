import type { SuggestionPriority } from "@/lib/types";

export interface AnnotationPriorityColor {
  bg: string;
  border: string;
  bgHover: string;
  text: string;
}

const PRIORITY_LABELS: Record<SuggestionPriority, string> = {
  high_impact: "High Impact",
  quick_win: "Quick Win",
};

const ANNOTATION_PRIORITY_COLORS: Record<
  SuggestionPriority,
  AnnotationPriorityColor
> = {
  high_impact: {
    bg: "rgba(239,68,68,0.15)",
    border: "rgba(239,68,68,0.5)",
    bgHover: "rgba(239,68,68,0.25)",
    text: "#ef4444",
  },
  quick_win: {
    bg: "rgba(245,158,11,0.15)",
    border: "rgba(245,158,11,0.5)",
    bgHover: "rgba(245,158,11,0.25)",
    text: "#f59e0b",
  },
};

const RESULTS_PRIORITY_BADGE_CLASSES: Record<SuggestionPriority, string> = {
  high_impact: "bg-[#FF8C42]/10 text-[#FF8C42] border-[#FF8C42]/20 shrink-0",
  quick_win: "bg-[#CAFF43]/10 text-[#CAFF43] border-[#CAFF43]/20 shrink-0",
};

export function getSuggestionPriorityLabel(priority: string): string {
  return PRIORITY_LABELS[priority as SuggestionPriority] ?? "Quick Win";
}

export function getAnnotationPriorityColor(
  priority: string,
): AnnotationPriorityColor {
  return (
    ANNOTATION_PRIORITY_COLORS[priority as SuggestionPriority] ??
    ANNOTATION_PRIORITY_COLORS.quick_win
  );
}

export function getResultsPriorityBadgeClasses(
  priority: SuggestionPriority,
): string {
  return RESULTS_PRIORITY_BADGE_CLASSES[priority];
}
