"use client";

import { useT } from "@/components/i18n/i18n-provider";
import { ChevronDown } from "lucide-react";
import { useAccountMenu } from "@/hooks/use-account-menu";
import { accountDisplayName, accountShortName } from "@/lib/account-menu";
import type { AuthUser } from "@/stores/auth-store";
import AccountAvatar from "./account-avatar";
import AccountMenuItems from "./account-menu-items";
import AccountSessions from "./account-sessions";
import styles from "./account-menu.module.css";

interface AccountMenuProps {
  user: AuthUser;
  app?: boolean;
}

function AccountTrigger({
  user,
  menu,
}: {
  user: AuthUser;
  menu: ReturnType<typeof useAccountMenu>;
}) {
  const { t } = useT();
  return (
    <button
      ref={menu.triggerRef}
      className={styles.trigger}
      type="button"
      aria-label={t("account.menu")}
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
  );
}

export default function AccountMenu({ user, app = false }: AccountMenuProps) {
  const menu = useAccountMenu();
  const { t } = useT();
  return (
    <div className={styles.account} ref={menu.rootRef}>
      <div className={styles.wrapper}>
        <div className={styles.surface} data-open={menu.open}>
          <AccountTrigger user={user} menu={menu} />
          <div
            className={styles.grid}
            style={{ gridTemplateRows: "repeat(3, 1fr)" }}
            role="menu"
            aria-label={t("account.menu")}
            aria-hidden={!menu.open}
            inert={!menu.open}
            onKeyDown={menu.onMenuKeyDown}
          >
            <AccountMenuItems menu={menu} app={app} />
          </div>
        </div>
      </div>
      <AccountSessions
        open={menu.sessionsOpen}
        onOpenChange={menu.setSessionsOpen}
      />
    </div>
  );
}
