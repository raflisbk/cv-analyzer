"use client";

import { Menu } from "lucide-react";
import AccountMenu from "@/components/landing/navbar/account-menu";
import { useT } from "@/components/i18n/i18n-provider";
import { useAuthStore } from "@/stores/auth-store";
import styles from "./app-shell.module.css";
import AppNav from "./app-nav";
import AppLogo from "./app-logo";

export default function AppHeader({
  openDrawer,
  drawerOpen,
  newChat,
}: {
  openDrawer: () => void;
  drawerOpen: boolean;
  newChat: () => void;
}) {
  const user = useAuthStore((state) => state.user);
  const { t } = useT();
  return (
    <header className={styles.header}>
      <button
        className={`${styles.pill} ${styles.snow} ${styles.round}`}
        type="button"
        aria-label={t("app.header.history")}
        aria-expanded={drawerOpen}
        onClick={openDrawer}
      >
        <Menu size={21} />
      </button>
      <AppLogo newChat={newChat} />
      <AppNav />
      <div className={styles.account} data-tour="account">
        {user && <AccountMenu user={user} app />}
      </div>
    </header>
  );
}
