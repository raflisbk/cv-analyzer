import { useEffect, type RefObject } from "react";

function focusableElements(root: HTMLElement | null): HTMLElement[] {
  const items = [
    ...(root?.querySelectorAll<HTMLElement>(
      "a[href],button:not([disabled]),input,textarea,[tabindex]:not([tabindex='-1'])",
    ) ?? []),
  ];
  const visible = items.filter((item) => item.getClientRects().length > 0);
  return visible.length ? visible : items;
}

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
    focusableElements(ref.current)[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
      if (event.key !== "Tab") {
        return;
      }
      const items = focusableElements(ref.current);
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
