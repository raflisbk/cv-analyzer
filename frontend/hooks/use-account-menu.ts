import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthLogout } from "./use-auth-logout";

function useDismissal(
  open: boolean,
  rootRef: React.RefObject<HTMLDivElement | null>,
  close: (restoreFocus?: boolean) => void,
) {
  useEffect(() => {
    if (!open) {
      return;
    }
    const outside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        close();
      }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
      }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [close, open, rootRef]);
}

function closeAfterTab(
  rootRef: React.RefObject<HTMLDivElement | null>,
  close: () => void,
) {
  requestAnimationFrame(() => {
    if (!rootRef.current?.contains(document.activeElement)) {
      close();
    }
  });
}

function useMenuKeyboard(
  rootRef: React.RefObject<HTMLDivElement | null>,
  itemRefs: React.RefObject<(HTMLElement | null)[]>,
  setOpen: (open: boolean) => void,
  close: () => void,
) {
  const onTriggerKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Tab") {
      return closeAfterTab(rootRef, close);
    }
    if (
      !["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(event.key)
    ) {
      return;
    }
    event.preventDefault();
    setOpen(true);
    const index = event.key === "ArrowUp" || event.key === "ArrowLeft" ? 1 : 0;
    requestAnimationFrame(() => itemRefs.current[index]?.focus());
  };
  const onMenuKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Tab") {
      return closeAfterTab(rootRef, close);
    }
    if (
      !["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(event.key)
    ) {
      return;
    }
    event.preventDefault();
    const current = itemRefs.current.indexOf(
      document.activeElement as HTMLElement,
    );
    const forward = event.key === "ArrowDown" || event.key === "ArrowRight";
    const count = itemRefs.current.filter(Boolean).length;
    const next = (current + (forward ? 1 : -1) + count) % count;
    itemRefs.current[next]?.focus();
  };
  return { onTriggerKeyDown, onMenuKeyDown };
}

export function useAccountMenu() {
  const [open, setOpen] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [confirmAll, setConfirmAll] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const close = useCallback((restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  }, []);
  useDismissal(open, rootRef, close);
  const keyboard = useMenuKeyboard(rootRef, itemRefs, setOpen, close);
  const logout = useAuthLogout(close);
  return {
    open,
    setOpen,
    rootRef,
    triggerRef,
    itemRefs,
    close,
    logout: () => logout(),
    logoutAll: () => logout(true),
    sessionsOpen,
    setSessionsOpen,
    confirmAll,
    setConfirmAll,
    ...keyboard,
  };
}
