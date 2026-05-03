"use client";
import { useMemo } from "react";

export function useVirtualElement(rect: DOMRect | null) {
  return useMemo(() => {
    if (!rect) {
      return null;
    }

    return {
      getBoundingClientRect: () => rect,
    };
  }, [rect]);
}
