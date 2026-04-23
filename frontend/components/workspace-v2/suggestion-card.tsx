"use client";
/**
 * SuggestionCard — Floating card showing suggestion details.
 * Phase 17: Displayed when hovering over text highlights in Tiptap editor.
 */
import { useMemo } from "react";
import { useWorkspaceV2Store } from "@/lib/stores/workspace-v2-store";
import type { SuggestionCard as SuggestionCardType } from "@/lib/types";

interface SuggestionCardProps {
  suggestionId: string;
  suggestions: SuggestionCardType[];
  onClose: () => void;
}

export function SuggestionCard({ suggestionId, suggestions, onClose }: SuggestionCardProps) {
  const setSuggestionStatus = useWorkspaceV2Store((s) => s.setSuggestionStatus);
  const suggestionStatuses = useWorkspaceV2Store((s) => s.suggestionStatuses);

  const status = suggestionStatuses[suggestionId];
  const isApplied = status === "applied";
  const isDismissed = status === "dismissed";

  // Find the suggestion item
  const { item, card } = useMemo(() => {
    const [section, itemIdx, _cardIdx] = suggestionId.split("_");
    const foundCard = suggestions.find((c) => c.section === section);
    if (!foundCard) return { item: null, card: null };
    const foundItem = foundCard.suggestions[parseInt(itemIdx)];
    return { item: foundItem, card: foundCard };
  }, [suggestionId, suggestions]);

  if (!item || !card) return null;

  const color = item.priority === "high_impact"
    ? { bg: "rgba(239,68,68,0.15)", border: "rgba(239,68,68,0.5)", text: "#ef4444" }
    : { bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.5)", text: "#f59e0b" };

  return (
    <div
      className="pointer-events-auto rounded-lg bg-white border shadow-lg"
      style={{
        borderColor: color.border,
        boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
        minWidth: 260,
        maxWidth: 320,
        padding: "14px 18px",
      }}
    >
      {/* Header with priority and section */}
      <div style={{ marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
          <span
            className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded"
            style={{
              background: color.bg,
              color: color.text,
            }}
          >
            {item.priority === "high_impact" ? "High Impact" : "Quick Win"}
          </span>
          <span className="text-[11px] font-medium text-gray-500">
            {card.section}
          </span>
        </div>
      </div>

      {/* Suggestion text */}
      <p
        className="text-[13px] leading-snug"
        style={{
          color: "#222",
          marginBottom: item.text ? "10px" : "16px",
          lineHeight: "1.5",
          fontWeight: "500",
        }}
      >
        {item.afterText || item.explanation || item.text}
      </p>

      {/* Original text for reference */}
      {item.text && item.text !== (item.afterText || item.explanation) && (
        <div
          style={{
            background: "#f5f5f5",
            padding: "8px 10px",
            borderRadius: "6px",
            marginBottom: "12px",
            borderLeft: `3px solid ${color.border}`,
          }}
        >
          <p className="text-[10px] text-gray-500 mb-1" style={{ margin: "0 0 4px 0", fontWeight: "600" }}>
            CURRENT:
          </p>
          <p
            className="text-[11px] leading-snug"
            style={{
              color: "#666",
              margin: 0,
              fontStyle: "italic",
              lineHeight: "1.4",
            }}
          >
            "{item.text.slice(0, 80)}"
            {item.text.length > 80 ? "..." : ""}
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSuggestionStatus(suggestionId, "applied");
            onClose();
          }}
          className="px-4 py-2 text-xs font-semibold rounded-md transition-all"
          style={{
            background: color.text,
            color: "#ffffff",
            border: "none",
            cursor: "pointer",
            flex: 1,
            textAlign: "center",
          }}
        >
          Apply
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSuggestionStatus(suggestionId, "dismissed");
            onClose();
          }}
          className="px-4 py-2 text-xs font-semibold rounded-md transition-all"
          style={{
            background: "#ffffff",
            color: "#666",
            border: "1px solid #e0e0e0",
            cursor: "pointer",
            flex: 1,
            textAlign: "center",
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
