import Link from "next/link";
import type { useAppShellHistoryDrawer } from "@/hooks/use-app-shell-history-drawer";
import HistoryGroup from "./history-group";
import styles from "./app-shell.module.css";
import drawerStyles from "./drawer.module.css";
import DrawerAccountFooter from "./drawer-account-footer";

type Drawer = ReturnType<typeof useAppShellHistoryDrawer>;
interface HistoryDrawerBodyProps {
  state: Drawer;
  close: () => void;
  newChat: () => void;
}

export default function HistoryDrawerBody({
  state,
  close,
  newChat,
}: HistoryDrawerBodyProps) {
  const { user, isError, refetch, groups, logOut } = state;
  return (
    <>
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
      <HistoryGroup title="Last 7 days" items={groups.lastWeek} close={close} />
      <DrawerAccountFooter
        name={user?.name ?? user?.email ?? "Account"}
        logOut={logOut}
      />
    </>
  );
}
