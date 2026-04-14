"use client";
/**
 * AnnotationOverlay — renders absolute-positioned hit-test divs at anchor rects.
 * Phase 14: ANNOT-01, ANNOT-02, ANNOT-03.
 *
 * Two-layer approach:
 * 1. customTextRenderer (in pdf-viewer-inner.tsx) injects colored spans in text layer for visual highlights.
 * 2. AnnotationHitArea renders transparent absolute divs at the same rects for mouse event capture.
 *
 * Coordinate conversion: PyMuPDF rects are in PDF points (top-left origin, y-down = CSS-compatible).
 * Scale by containerWidth / pageWidth to get CSS pixels.
 */
import { useState, useCallback, useRef } from "react";
import { FloatingPortal, useFloating, shift, offset, flip } from "@floating-ui/react";
import { useWorkspaceV2Store } from "@/lib/stores/workspace-v2-store";
import type { SuggestionAnchorRecord } from "@/lib/workspace";

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
  onApply?: (suggestionId: string) => void;
  onDismiss?: (suggestionId: string) => void;
}

function AnnotationHitArea({ anchor, scale, onApply, onDismiss }: AnnotationHitAreaProps) {
  const setActiveSuggestionId = useWorkspaceV2Store((s) => s.setActiveSuggestionId);
  const setSuggestionStatus = useWorkspaceV2Store((s) => s.setSuggestionStatus);
  const suggestionStatuses = useWorkspaceV2Store((s) => s.suggestionStatuses);
  const status = suggestionStatuses[anchor.suggestion_id];
  const isApplied = status === "applied";
  const isDismissed = status === "dismissed";

  // Manual hover state with 1.5 second timeout
  const [isOpen, setIsOpen] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearHoverTimeout = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  }, []);

  const handleMouseEnter = useCallback(() => {
    clearHoverTimeout();
    setActiveSuggestionId(anchor.suggestion_id);
    setIsOpen(true);
  }, [anchor.suggestion_id, clearHoverTimeout]);

  const handleMouseLeave = useCallback(() => {
    // Wait 1.5 seconds before hiding the card
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setActiveSuggestionId(null);
    }, 1500);
  }, [clearHoverTimeout]);

  const handleCardMouseEnter = useCallback(() => {
    // When hovering the card itself, clear the hide timeout
    clearHoverTimeout();
  }, [clearHoverTimeout]);

  const handleCardMouseLeave = useCallback(() => {
    // When leaving the card, wait 1.5 seconds before hiding
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setActiveSuggestionId(null);
    }, 1500);
  }, [clearHoverTimeout]);

  const color = priorityToColor(anchor.priority);
  const cssRect = {
    left: anchor.rect.x * scale,
    top: anchor.rect.y * scale,
    width: anchor.rect.w * scale,
    height: anchor.rect.h * scale,
  };

  // Set up floating UI with proper positioning
  const { refs, floatingStyles, context } = useFloating({
    placement: "top",
    middleware: [
      offset(10), // 10px gap from highlight
      shift({ padding: 10 }),
      flip({
        fallbackPlacements: ["bottom", "left", "right"],
      }),
    ],
  });

  return (
    <>
      {/* Visual highlight — shows colored background */}
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
          opacity: isApplied ? 0.15 : isDismissed ? 0.1 : 1.0,
          transition: "opacity 200ms ease",
          pointerEvents: "none",
        }}
        aria-hidden="true"
        data-suggestion-id={anchor.suggestion_id}
      />

      {/* Hit area — transparent div for mouse events */}
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
          opacity: isApplied ? 0.15 : isDismissed ? 0.1 : 1.0,
          transition: "opacity 200ms ease",
          pointerEvents: isApplied || isDismissed ? "none" : "auto",
        }}
        aria-label={`Suggestion: ${anchor.text_anchor.slice(0, 60)}`}
      />

      {isOpen && (
        <FloatingPortal>
          <div
            ref={refs.setFloating}
            style={{
              ...floatingStyles,
              zIndex: 9999,
              borderRadius: 8,
              background: "#ffffff",
              border: "1px solid rgba(0,0,0,0.08)",
              padding: "12px 16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              minWidth: 220,
              maxWidth: 280,
              color: "#1a1a1a",
            }}
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
          >
            <p
              className="text-[10px] font-semibold uppercase tracking-wide"
              style={{
                color: color.text,
                marginBottom: "8px",
              }}
            >
              {anchor.priority === "high_impact" ? "High Impact" : "Quick Win"}
            </p>

            <p
              className="text-[12px] leading-snug"
              style={{
                color: "#666",
                marginBottom: "12px",
                lineHeight: "1.4",
              }}
            >
              {anchor.text_anchor.slice(0, 80)}
              {anchor.text_anchor.length > 80 ? "…" : ""}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSuggestionStatus(anchor.suggestion_id, "applied");
                  onApply?.(anchor.suggestion_id);
                  setIsOpen(false);
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
                  setIsOpen(false);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-md transition-all"
                style={{
                  background: "transparent",
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
  onApply?: (suggestionId: string) => void;
  onDismiss?: (suggestionId: string) => void;
}

export function AnnotationOverlay({
  anchors,
  pageIndex,
  pageWidth,
  containerWidth,
  onApply,
  onDismiss,
}: AnnotationOverlayProps) {
  if (!anchors.length || containerWidth === 0 || pageWidth === 0) {
    return null;
  }

  const scale = containerWidth / pageWidth;
  const pageAnchors = anchors.filter((a) => a.page_index === pageIndex);

  if (!pageAnchors.length) {
    return null;
  }

  return (
    <>
      {pageAnchors.map((anchor) => (
        <AnnotationHitArea
          key={anchor.suggestion_id}
          anchor={anchor}
          scale={scale}
          onApply={onApply}
          onDismiss={onDismiss}
        />
      ))}
    </>
  );
}
