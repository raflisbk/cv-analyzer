"use client";

import { useAppShellHistoryDrawer } from "@/hooks/use-app-shell-history-drawer";
import HistoryDrawerBody from "./history-drawer-body";
import drawerStyles from "./drawer.module.css";

export default function HistoryDrawer({
  open,
  close,
  newChat,
}: {
  open: boolean;
  close: () => void;
  newChat: () => void;
}) {
  const state = useAppShellHistoryDrawer(open, close);
  return (
    <>
      {open && (
        <button
          className={drawerStyles.scrim}
          type="button"
          aria-label="Close chat history"
          onClick={close}
        />
      )}
      <aside
        ref={state.ref}
        className={drawerStyles.drawer}
        data-open={open}
        inert={!open}
        aria-hidden={!open}
        aria-label="Chat history"
      >
        <HistoryDrawerBody state={state} close={close} newChat={newChat} />
      </aside>
    </>
  );
}
