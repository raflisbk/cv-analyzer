"use client";

import { ChevronDown } from "lucide-react";
import { useAccountMenu } from "@/hooks/use-account-menu";
import { accountDisplayName, accountShortName } from "@/lib/account-menu";
import type { AuthUser } from "@/stores/auth-store";
import AccountAvatar from "./account-avatar";
import AccountMenuItems from "./account-menu-items";
import styles from "./account-menu.module.css";

export default function AccountMenu({ user }: { user: AuthUser }) {
  const menu = useAccountMenu();
  return (
    <div className={styles.account} ref={menu.rootRef}>
      <div className={styles.wrapper}>
        <div className={styles.surface} data-open={menu.open}>
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
            <span className={styles.text}>
              <span className={styles.shortName}>{accountShortName(user)}</span>
              <span className={styles.identity}>
                <strong>{accountDisplayName(user)}</strong>
                <small>{user.email}</small>
              </span>
            </span>
            <ChevronDown
              className={styles.chevron}
              size={16}
              strokeWidth={3}
              aria-hidden="true"
            />
          </button>
          <div
            className={styles.grid}
            role="menu"
            aria-label="Account"
            aria-hidden={!menu.open}
            inert={!menu.open}
            onKeyDown={menu.onMenuKeyDown}
          >
            <AccountMenuItems menu={menu} />
          </div>
        </div>
      </div>
    </div>
  );
}
