"use client";

import { useMemo } from "react";
import type { SuggestionAnchorRecord } from "@/lib/workspace";
import type { SuggestionCard } from "@/lib/types";
import { AnnotationHitArea } from "./annotation-hit-area";

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

  if (!anchors.length || containerWidth === 0 || pageWidth === 0) {
    return null;
  }

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
          suggestions={suggestionsMap}
          onApply={onApply}
          onDismiss={onDismiss}
        />
      ))}
    </>
  );
}
