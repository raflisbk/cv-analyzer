"use client";

import { useEffect, useRef } from "react";

export function useAppWorkspaceFocusTrap(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>("button")?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeRef.current();
      }
      if (event.key !== "Tab" || !ref.current) {
        return;
      }
      const focusable = Array.from(
        ref.current.querySelectorAll<HTMLElement>("button,input"),
      );
      const index = focusable.indexOf(document.activeElement as HTMLElement);
      if (event.shiftKey && index === 0) {
        event.preventDefault();
        focusable.at(-1)?.focus();
      }
      if (!event.shiftKey && index === focusable.length - 1) {
        event.preventDefault();
        focusable[0]?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  return ref;
}
