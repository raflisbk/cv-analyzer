import Link from "next/link";
import { ArrowUpRight, LayoutGrid, LogOut } from "lucide-react";
import type { useAccountMenu } from "@/hooks/use-account-menu";
import AccountSettingsRow from "./account-settings-row";
import styles from "./account-menu.module.css";

type Menu = ReturnType<typeof useAccountMenu>;
interface AccountMenuItemsProps {
  menu: Menu;
  app?: boolean;
}

export default function AccountMenuItems({
  menu,
  app = false,
}: AccountMenuItemsProps) {
  return (
    <>
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
        <span>{app ? "My CVs" : "Workspace"}</span>
        <ArrowUpRight className={styles.arrow} size={28} aria-hidden="true" />
      </Link>
      <AccountSettingsRow />
      <button
        ref={(node) => {
          menu.itemRefs.current[1] = node;
        }}
        type="button"
        role="menuitem"
        className={`${styles.tile} ${styles.logout}`}
        onClick={menu.logout}
      >
        <span className={styles.icon}>
          <LogOut size={22} strokeWidth={2.4} />
        </span>
        Log out
      </button>
    </>
  );
}
