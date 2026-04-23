"use client";
/**
 * useVirtualElement — Create a virtual element for FloatingUI from a DOMRect.
 * Used for positioning floating UI relative to text selection.
 */
import { useMemo } from "react";

export function useVirtualElement(rect: DOMRect | null) {
  return useMemo(() => {
    if (!rect) return null;

    return {
      getBoundingClientRect: () => rect,
    };
  }, [rect]);
}
