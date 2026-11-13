import type { useAppShellHistoryDrawer } from "@/hooks/use-app-shell-history-drawer";
import HistoryGroup from "./history-group";
import DrawerAccountFooter from "./drawer-account-footer";
import LoadingSkeleton from "./loading-skeleton";
import HistoryDrawerActions from "./history-drawer-actions";

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
  const { user, isLoading, isError, refetch, groups, logOut } = state;
  return (
    <>
      <HistoryDrawerActions close={close} newChat={newChat} />
      {isError && (
        <p role="alert">
          Could not load chats.{" "}
          <button onClick={() => refetch()}>Try again</button>
        </p>
      )}
      {isLoading && <LoadingSkeleton label="Loading conversations" />}
      {!isLoading &&
        !isError &&
        !groups.today.length &&
        !groups.lastWeek.length &&
        !groups.older.length && (
          <p>No conversations yet. Start a new chat above.</p>
        )}
      <HistoryGroup title="Today" items={groups.today} close={close} />
      <HistoryGroup title="Last 7 days" items={groups.lastWeek} close={close} />
      <HistoryGroup title="Older" items={groups.older} close={close} />
      <DrawerAccountFooter
        name={user?.name ?? user?.email ?? "Account"}
        logOut={logOut}
      />
    </>
  );
}
