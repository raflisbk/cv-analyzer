"use client";

import { useT } from "@/components/i18n/i18n-provider";
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
  const { t } = useT();
  const { user, isLoading, isError, refetch, groups, logOut } = state;
  return (
    <>
      <HistoryDrawerActions close={close} newChat={newChat} />
      {isError && (
        <p role="alert">
          {t("app.drawer.loadError")}{" "}
          <button onClick={() => refetch()}>{t("app.drawer.retry")}</button>
        </p>
      )}
      {isLoading && <LoadingSkeleton label={t("app.drawer.loading")} />}
      {!isLoading &&
        !isError &&
        !groups.today.length &&
        !groups.lastWeek.length &&
        !groups.older.length && <p>{t("app.drawer.empty")}</p>}
      <HistoryGroup
        title={t("app.drawer.today")}
        items={groups.today}
        close={close}
      />
      <HistoryGroup
        title={t("app.drawer.lastWeek")}
        items={groups.lastWeek}
        close={close}
      />
      <HistoryGroup
        title={t("app.drawer.older")}
        items={groups.older}
        close={close}
      />
      <DrawerAccountFooter
        name={user?.name ?? user?.email ?? t("app.drawer.account")}
        logOut={logOut}
      />
    </>
  );
}
