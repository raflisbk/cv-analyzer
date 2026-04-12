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
import { FloatingPortal } from "@floating-ui/react";
import { useWorkspaceV2Store } from "@/lib/stores/workspace-v2-store";
import { useAnnotationHover } from "@/hooks/use-annotation-hover";
import type { SuggestionAnchorRecord } from "@/lib/workspace";

export function priorityToColor(
  priority: string
): { bg: string; border: string; bgHover: string } {
  const map: Record<string, { bg: string; border: string; bgHover: string }> = {
    high_impact: {
      bg: "rgba(239,68,68,0.25)",
      border: "rgba(239,68,68,0.7)",
      bgHover: "rgba(239,68,68,0.45)",
    },
    quick_win: {
      bg: "rgba(245,158,11,0.25)",
      border: "rgba(245,158,11,0.7)",
      bgHover: "rgba(245,158,11,0.45)",
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
  const { isOpen, refs, floatingStyles, getReferenceProps, getFloatingProps } =
    useAnnotationHover({ placement: "top" });

  const _color = priorityToColor(anchor.priority);
  const cssRect = {
    left: anchor.rect.x * scale,
    top: anchor.rect.y * scale,
    width: anchor.rect.w * scale,
    height: anchor.rect.h * scale,
  };

  return (
    <>
      <div
        ref={refs.setReference}
        data-suggestion-id={anchor.suggestion_id}
        {...getReferenceProps({
          onMouseEnter: () => setActiveSuggestionId(anchor.suggestion_id),
          onMouseLeave: () => setActiveSuggestionId(null),
        })}
        style={{
          position: "absolute",
          left: cssRect.left,
          top: cssRect.top,
          width: cssRect.width,
          height: cssRect.height,
          zIndex: 3,
          cursor: "pointer",
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
              borderRadius: 10,
              background: "#141414",
              border: "1px solid rgba(255,255,255,0.12)",
              padding: "8px 12px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.28)",
              minWidth: 180,
            }}
            {...getFloatingProps()}
          >
            <p
              className="mb-2 text-[9px] font-extrabold uppercase tracking-widest"
              style={{
                color: anchor.priority === "high_impact" ? "#ef4444" : "#f59e0b",
              }}
            >
              {anchor.priority === "high_impact" ? "High Impact" : "Quick Win"}
            </p>

            <p className="mb-3 text-[11px] leading-relaxed text-[#F5F2D8]/80">
              {anchor.text_anchor.slice(0, 80)}
              {anchor.text_anchor.length > 80 ? "…" : ""}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onApply?.(anchor.suggestion_id)}
                className="flex-1 rounded-full px-3 py-1.5 text-[11px] font-black tracking-wide transition-colors"
                style={{
                  background: "rgba(202,255,67,0.28)",
                  border: "1px solid rgba(202,255,67,0.4)",
                  color: "#2a4200",
                }}
              >
                Apply
              </button>
              <button
                type="button"
                onClick={() => onDismiss?.(anchor.suggestion_id)}
                className="flex-1 rounded-full px-3 py-1.5 text-[11px] font-black tracking-wide transition-colors"
                style={{
                  background: "rgba(17,17,17,0.10)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#F5F2D8",
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
  if (!anchors.length || containerWidth === 0 || pageWidth === 0) { return null; }

  const scale = containerWidth / pageWidth;
  const pageAnchors = anchors.filter((a) => a.page_index === pageIndex);

  if (!pageAnchors.length) { return null; }

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
