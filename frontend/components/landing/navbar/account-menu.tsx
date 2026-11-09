"use client";

import { ChevronDown } from "lucide-react";
import { useAccountMenu } from "@/hooks/use-account-menu";
import type { AuthUser } from "@/stores/auth-store";
import AccountAvatar from "./account-avatar";
import AccountMenuPanel from "./account-menu-panel";
import styles from "./account-menu.module.css";

export default function AccountMenu({ user }: { user: AuthUser }) {
  const menu = useAccountMenu();
  return (
    <div className={styles.account} ref={menu.rootRef}>
      <button
        ref={menu.triggerRef}
        className={styles.trigger}
        type="button"
        aria-label="Account menu"
        aria-haspopup="menu"
        aria-expanded={menu.open}
        onClick={() => menu.setOpen(!menu.open)}
        onKeyDown={menu.onTriggerKeyDown}
      >
        <AccountAvatar user={user} />
        <ChevronDown
          size={16}
          strokeWidth={3}
          className={styles.chevron}
          aria-hidden="true"
        />
      </button>
      {menu.open && <AccountMenuPanel user={user} menu={menu} />}
    </div>
  );
}
