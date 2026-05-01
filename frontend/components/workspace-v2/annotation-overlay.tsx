"use client";

import { useCallback, useMemo } from "react";
import { FloatingPortal, useFloating, shift, offset, flip } from "@floating-ui/react";
import { useWorkspaceV2Store } from "@/lib/stores/workspace-v2-store";
import type { SuggestionAnchorRecord } from "@/lib/workspace";
import type { SuggestionCard } from "@/lib/types";

export function priorityToColor(
  priority: string
): { bg: string; border: string; bgHover: string; text: string } {
  const map: Record<string, { bg: string; border: string; bgHover: string; text: string }> = {
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
  return map[priority] ?? map["quick_win"];
}

interface AnnotationHitAreaProps {
  anchor: SuggestionAnchorRecord;
  scale: number;
  suggestions: Map<string, { text: string; afterText?: string }>;
  onApply?: (suggestionId: string) => void;
  onDismiss?: (suggestionId: string) => void;
}

function AnnotationHitArea({ anchor, scale, suggestions, onApply, onDismiss }: AnnotationHitAreaProps) {
  const setActiveSuggestionId = useWorkspaceV2Store((s) => s.setActiveSuggestionId);
  const setSuggestionStatus = useWorkspaceV2Store((s) => s.setSuggestionStatus);
  const suggestionStatuses = useWorkspaceV2Store((s) => s.suggestionStatuses);
  const activeSuggestionId = useWorkspaceV2Store((s) => s.activeSuggestionId);
  const viewMode = useWorkspaceV2Store((s) => s.viewMode);
  
  const status = suggestionStatuses[anchor.suggestion_id];
  const isApplied = status === "applied";
  const isDismissed = status === "dismissed";

  const isOriginalMode = viewMode === "original";
  const showHighlight = !isApplied && !isOriginalMode;
  const showPatch = isApplied && !isOriginalMode;

  // Show card only if this is the active suggestion (prevent overlap)
  const shouldShowCard = activeSuggestionId === anchor.suggestion_id && !isOriginalMode;

  const color = priorityToColor(anchor.priority);
  const cssRect = {
    left: anchor.rect.x * scale,
    top: anchor.rect.y * scale,
    width: anchor.rect.w * scale,
    height: anchor.rect.h * scale,
  };

  const suggestion = suggestions.get(anchor.suggestion_id);
  const suggestionText = suggestion?.afterText || suggestion?.text || anchor.text_anchor;

  const { refs, floatingStyles } = useFloating({
    placement: "top",
    middleware: [
      offset(10),
      shift({ padding: 10 }),
      flip({
        fallbackPlacements: ["bottom", "left", "right"],
      }),
    ],
  });

  const handleMouseEnter = useCallback(() => {
    setActiveSuggestionId(anchor.suggestion_id);
  }, [anchor.suggestion_id, setActiveSuggestionId]);

  const handleMouseLeave = useCallback(() => {
    setTimeout(() => {
      setActiveSuggestionId(null);
    }, 100);
  }, [setActiveSuggestionId]);

  return (
    <>
      {showHighlight && (
        <div
          style={{
            position: "absolute",
            left: cssRect.left,
            top: cssRect.top,
            width: cssRect.width,
            height: cssRect.height,
            zIndex: 2,
            background: color.bg,
            borderBottom: `2px solid ${color.border}`,
            borderRadius: "2px",
            opacity: isDismissed ? 0.0 : 1.0,
            transition: "opacity 200ms ease",
            pointerEvents: "none",
          }}
          aria-hidden="true"
          data-suggestion-id={anchor.suggestion_id}
        />
      )}

      {showPatch && (
        <div
          style={{
            position: "absolute",
            left: cssRect.left,
            minHeight: cssRect.height + 4,
            zIndex: 10,
            background: "#ffffff",
            padding: "2px 4px",
            color: "#111111",
            fontFamily: "var(--font-sans), sans-serif",
            lineHeight: "1.4",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            borderRadius: "3px",
            pointerEvents: "none",
            transformOrigin: "top left",
          }}
          aria-hidden="true"
        >
          {suggestionText}
        </div>
      )}

      {(!isOriginalMode) && (
        <div
          ref={refs.setReference}
          data-suggestion-id={anchor.suggestion_id}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            position: "absolute",
            left: cssRect.left,
            top: cssRect.top,
            width: cssRect.width,
            height: cssRect.height,
            zIndex: 3,
            cursor: isApplied || isDismissed ? "default" : "pointer",
            opacity: showHighlight ? 1.0 : 0.0,
            transition: "opacity 200ms ease",
            pointerEvents: isApplied || isDismissed ? "none" : "auto",
          }}
          aria-label={`Suggestion: ${suggestionText.slice(0, 60)}`}
        />
      )}

      {shouldShowCard && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={{
              ...floatingStyles,
              zIndex: 9999,
              borderRadius: 8,
              background: "#ffffff",
              border: `1px solid ${color.border}`,
              padding: "14px 18px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
              minWidth: 260,
              maxWidth: 320,
              color: "#1a1a1a",
            }}
          >
            <div style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <span
                  className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded"
                  style={{
                    background: color.bg,
                    color: color.text,
                  }}
                >
                  {anchor.priority === "high_impact" ? "High Impact" : "Quick Win"}
                </span>
                <span className="text-[11px] font-medium text-gray-500">
                  {anchor.section}
                </span>
              </div>
            </div>

            <p
              className="text-[13px] leading-snug"
              style={{
                color: "#222",
                marginBottom: suggestion?.text ? "10px" : "16px",
                lineHeight: "1.5",
                fontWeight: "500",
              }}
            >
              {suggestionText}
            </p>

            {suggestion?.text && suggestion.text !== suggestionText && (
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
                  {"\u0022"}{suggestion.text.slice(0, 80)}{"\u0022"}
                  {suggestion.text.length > 80 ? "..." : ""}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSuggestionStatus(anchor.suggestion_id, "applied");
                  onApply?.(anchor.suggestion_id);
                  setActiveSuggestionId(null);
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
                  setSuggestionStatus(anchor.suggestion_id, "dismissed");
                  onDismiss?.(anchor.suggestion_id);
                  setActiveSuggestionId(null);
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
        </FloatingPortal>
      )}
    </>
  );
}

interface AnnotationOverlayProps {
  anchors: SuggestionAnchorRecord[];
  pageIndex: number;
  pageWidth: number;
  containerWidth: number;
  scale?: number;
  suggestions?: SuggestionCard[];
  onApply?: (suggestionId: string) => void;
  onDismiss?: (suggestionId: string) => void;
}

export function AnnotationOverlay({
  anchors,
  pageIndex,
  pageWidth,
  containerWidth,
  scale = 1.0,
  suggestions = [],
  onApply,
  onDismiss,
}: AnnotationOverlayProps) {
  if (!anchors.length || containerWidth === 0 || pageWidth === 0) {
    return null;
  }

  const pageAnchors = anchors.filter(
    (a) => a.page_index === pageIndex
  );

  if (!pageAnchors.length) {
    return null;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const suggestionsMap = useMemo(() => {
    const map = new Map<string, { text: string; afterText?: string }>();
    for (const card of suggestions) {
      card.suggestions.forEach((item, itemIdx) => {
        const suggestionId = `${card.section}_${itemIdx}_0`;
        map.set(suggestionId, {
          text: item.text,
          afterText: item.afterText || item.explanation,
        });
      });
    }
    return map;
  }, [suggestions]);

  return (
    <>
      {pageAnchors.map((anchor) => (
        <AnnotationHitArea
          key={anchor.suggestion_id}
          anchor={anchor}
          scale={scale}
          suggestions={suggestionsMap}
          onApply={onApply}
          onDismiss={onDismiss}
        />
      ))}
    </>
  );
}
