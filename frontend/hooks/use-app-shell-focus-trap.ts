import { useEffect, type RefObject } from "react";

export function useAppShellFocusTrap(
  open: boolean,
  ref: RefObject<HTMLElement | null>,
  close: () => void,
) {
  useEffect(() => {
    if (!open) {
      return;
    }
    const previous = document.activeElement as HTMLElement | null;
    const focusable = () => {
      const items = [
        ...(ref.current?.querySelectorAll<HTMLElement>(
          "a[href],button:not([disabled]),input,textarea,[tabindex]:not([tabindex='-1'])",
        ) ?? []),
      ];
      const visible = items.filter((item) => item.getClientRects().length > 0);
      return visible.length ? visible : items;
    };
    focusable()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
      if (event.key !== "Tab") {
        return;
      }
      const items = focusable();
      if (!items.length) {
        return;
      }
      const first = items[0],
        last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open, ref, close]);
}
