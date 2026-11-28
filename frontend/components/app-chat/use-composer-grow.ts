"use client";

import { useLayoutEffect, type RefObject } from "react";

const MAX_LINES = 6;

export function useComposerGrow(
  ref: RefObject<HTMLTextAreaElement | null>,
  value: string,
) {
  useLayoutEffect(() => {
    const field = ref.current;
    if (!field) {
      return;
    }
    const style = getComputedStyle(field);
    const lineHeight = parseFloat(style.lineHeight) || 24;
    const padding =
      parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    field.style.height = "auto";
    field.style.height = `${Math.min(field.scrollHeight, lineHeight * MAX_LINES + padding)}px`;
  }, [ref, value]);
}
