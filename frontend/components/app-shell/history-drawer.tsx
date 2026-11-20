"use client";

import { useAppShellHistoryDrawer } from "@/hooks/use-app-shell-history-drawer";
import { useT } from "@/components/i18n/i18n-provider";
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
  const { t } = useT();
  const state = useAppShellHistoryDrawer(open, close);
  return (
    <>
      {open && (
        <button
          className={drawerStyles.scrim}
          type="button"
          aria-label={t("app.drawer.close")}
          onClick={close}
        />
      )}
      <aside
        ref={state.ref}
        className={drawerStyles.drawer}
        data-open={open}
        inert={!open}
        aria-hidden={!open}
        aria-label={t("app.drawer.title")}
      >
        <HistoryDrawerBody state={state} close={close} newChat={newChat} />
      </aside>
    </>
  );
}
