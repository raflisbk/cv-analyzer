import Link from "next/link";
import { LayoutGrid, LogOut } from "lucide-react";
import type { useAccountMenu } from "@/hooks/use-account-menu";
import AccountSettingsRow from "./account-settings-row";
import styles from "./account-menu.module.css";

type Menu = ReturnType<typeof useAccountMenu>;

export default function AccountMenuItems({ menu }: { menu: Menu }) {
  return (
    <>
      <Link
        ref={(node) => {
          menu.itemRefs.current[0] = node;
        }}
        href="/workspace-v2/new"
        role="menuitem"
        className={styles.item}
        onClick={() => menu.close()}
      >
        <span className={styles.icon}>
          <LayoutGrid size={22} strokeWidth={2.4} />
        </span>
        Workspace
      </Link>
      <AccountSettingsRow />
      <button
        ref={(node) => {
          menu.itemRefs.current[1] = node;
        }}
        type="button"
        role="menuitem"
        className={`${styles.item} ${styles.logout}`}
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
