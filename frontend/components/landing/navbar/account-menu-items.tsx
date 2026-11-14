import Link from "next/link";
import { useT } from "@/components/i18n/i18n-provider";
import { ArrowUpRight, LayoutGrid, LogOut, Monitor } from "lucide-react";
import type { useAccountMenu } from "@/hooks/use-account-menu";
import AccountSessionsAllDevices from "./account-sessions-all-devices";
import styles from "./account-menu.module.css";

type Menu = ReturnType<typeof useAccountMenu>;
interface AccountMenuItemsProps {
  menu: Menu;
  app?: boolean;
}

function WorkspaceItem({ menu, app = false }: AccountMenuItemsProps) {
  const { t } = useT();
  return (
    <Link
      ref={(node) => {
        menu.itemRefs.current[0] = node;
      }}
      href={app ? "/app/cvs" : "/app"}
      role="menuitem"
      className={`${styles.tile} ${styles.workspace}`}
      onClick={() => menu.close()}
    >
      <span className={styles.icon}>
        <LayoutGrid size={22} strokeWidth={2.4} />
      </span>
      <span>{t(app ? "account.cvs" : "account.workspace")}</span>
      <ArrowUpRight className={styles.arrow} size={28} aria-hidden="true" />
    </Link>
  );
}

function SessionsItem({ menu }: { menu: Menu }) {
  const { t } = useT();
  return (
    <button
      ref={(node) => {
        menu.itemRefs.current[1] = node;
      }}
      type="button"
      role="menuitem"
      className={styles.tile}
      onClick={() => {
        menu.close();
        menu.setSessionsOpen(true);
      }}
    >
      <span className={styles.icon}>
        <Monitor size={22} aria-hidden="true" />
      </span>
      {t("account.sessions")}
    </button>
  );
}

function LogoutItem({ menu }: { menu: Menu }) {
  const { t } = useT();
  return (
    <button
      ref={(node) => {
        menu.itemRefs.current[2] = node;
      }}
      type="button"
      role="menuitem"
      className={`${styles.tile} ${styles.logout}`}
      onClick={menu.logout}
    >
      <span className={styles.icon}>
        <LogOut size={22} strokeWidth={2.4} />
      </span>
      {t("account.logout")}
    </button>
  );
}

export default function AccountMenuItems({
  menu,
  app = false,
}: AccountMenuItemsProps) {
  return (
    <>
      <WorkspaceItem menu={menu} app={app} />
      <SessionsItem menu={menu} />
      <LogoutItem menu={menu} />
      <AccountSessionsAllDevices menu={menu} />
    </>
  );
}
