"use client";

import Link from "next/link";
import { useAppShellHistoryDrawer } from "@/hooks/use-app-shell-history-drawer";
import HistoryGroup from "./history-group";
import styles from "./app-shell.module.css";
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
  const { ref, user, isError, refetch, groups, logOut } =
    useAppShellHistoryDrawer(open, close);
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
        ref={ref}
        className={drawerStyles.drawer}
        data-open={open}
        inert={!open}
        aria-hidden={!open}
        aria-label="Chat history"
      >
        <div className={drawerStyles.drawerTop}>
          <strong>Chat history</strong>
          <button type="button" onClick={close} aria-label="Close chat history">
            ×
          </button>
        </div>
        <Link
          className={`${styles.pill} ${styles.punk}`}
          href="/app"
          onClick={() => {
            newChat();
            close();
          }}
        >
          + New chat
        </Link>
        {isError && (
          <p>
            Could not load chats.{" "}
            <button onClick={() => refetch()}>Try again</button>
          </p>
        )}
        <HistoryGroup title="Today" items={groups.today} close={close} />
        <HistoryGroup
          title="Last 7 days"
          items={groups.lastWeek}
          close={close}
        />
        <div className={drawerStyles.drawerFooter}>
          <span>{user?.name ?? user?.email ?? "Account"}</span>
          <button type="button" onClick={logOut}>
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
