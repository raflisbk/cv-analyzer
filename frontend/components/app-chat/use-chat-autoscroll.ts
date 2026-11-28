"use client";

import { useEffect, useRef } from "react";

const NEAR_BOTTOM_PX = 160;

export function useChatAutoscroll(signature: string, hasContent: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const settled = useRef(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || !hasContent) {
      return;
    }
    const gap = element.scrollHeight - element.scrollTop - element.clientHeight;
    if (!settled.current || gap < NEAR_BOTTOM_PX) {
      element.scrollTop = element.scrollHeight;
    }
    settled.current = true;
  }, [signature, hasContent]);
  return ref;
}
