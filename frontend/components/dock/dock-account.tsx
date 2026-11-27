"use client";

import Link from "next/link";
import { LayoutGrid, LogOut, Monitor } from "lucide-react";
import { useT } from "@/components/i18n/i18n-provider";
import { useAccountMenu } from "@/hooks/use-account-menu";
import AccountAvatar from "@/components/landing/navbar/account-avatar";
import AccountSessions from "@/components/landing/navbar/account-sessions";
import type { AuthUser } from "@/stores/auth-store";
import roundStyles from "./dock-round.module.css";
import styles from "./dock-account.module.css";

export default function DockAccount({
  user,
  app,
}: {
  user: AuthUser;
  app: boolean;
}) {
  const menu = useAccountMenu();
  const { t } = useT();
  return (
    <div className={styles.root} ref={menu.rootRef}>
      <button
        ref={menu.triggerRef}
        type="button"
        className={`${roundStyles.round} ${styles.avatar}`}
        aria-label={t("account.menu")}
        aria-haspopup="menu"
        aria-expanded={menu.open}
        onClick={() => menu.setOpen(!menu.open)}
        onKeyDown={menu.onTriggerKeyDown}
      >
        <AccountAvatar user={user} />
      </button>
      <div
        className={styles.menu}
        role="menu"
        aria-label={t("account.menu")}
        data-open={menu.open}
        aria-hidden={!menu.open}
        inert={!menu.open}
        onKeyDown={menu.onMenuKeyDown}
      >
        <Link
          ref={(node) => {
            menu.itemRefs.current[0] = node;
          }}
          href={app ? "/app/cvs" : "/app"}
          role="menuitem"
          onClick={() => menu.close()}
        >
          <LayoutGrid size={18} aria-hidden="true" />
          {t(app ? "account.cvs" : "account.workspace")}
        </Link>
        <button
          ref={(node) => {
            menu.itemRefs.current[1] = node;
          }}
          type="button"
          role="menuitem"
          onClick={() => {
            menu.close();
            menu.setSessionsOpen(true);
          }}
        >
          <Monitor size={18} aria-hidden="true" />
          {t("account.sessions")}
        </button>
        <button
          ref={(node) => {
            menu.itemRefs.current[2] = node;
          }}
          type="button"
          role="menuitem"
          onClick={menu.logout}
        >
          <LogOut size={18} aria-hidden="true" />
          {t("account.logout")}
        </button>
      </div>
      <AccountSessions
        open={menu.sessionsOpen}
        onOpenChange={menu.setSessionsOpen}
      />
    </div>
  );
}
